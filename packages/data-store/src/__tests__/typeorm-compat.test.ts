import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  Column,
  DataSource,
  Entity,
  IsNull,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Entities } from '../index.js'

describe('TypeORM 1.0 behavioral changes', () => {
  describe('audit of @veramo/data-store entities', () => {
    it('never marks a relation nullable: false', async () => {
      const connection = await new DataSource({ type: 'better-sqlite3', database: ':memory:', entities: Entities }).initialize()
      try {
        const offenders: string[] = []
        for (const metadata of connection.entityMetadatas) {
          for (const relation of metadata.relations.filter((r) => r.isWithJoinColumn)) {
            if (!relation.isNullable) {
              offenders.push(`${metadata.name}.${relation.propertyName}`)
            }
          }
        }
        expect(offenders).toEqual([])
      } finally {
        await connection.destroy()
      }
    })
  })

  describe('demonstration: join strategy for relations', () => {
    @Entity({ name: 'scratch_demo_user' })
    class DemoUser {
      @PrimaryGeneratedColumn()
      userId!: number
    }

    // nullable: false => INNER JOIN in TypeORM 1.0 (rows whose FK does not
    // resolve, e.g. pointing at a deleted or never-inserted author, get dropped)
    @Entity({ name: 'scratch_demo_required_post' })
    class DemoRequiredPost {
      @PrimaryColumn({ type: 'varchar' })
      id!: string

      @ManyToOne(() => DemoUser, { nullable: false, createForeignKeyConstraints: false })
      author!: DemoUser
    }

    // nullable: true (the default, as in all @veramo/data-store entities) => LEFT JOIN
    @Entity({ name: 'scratch_demo_nullable_post' })
    class DemoNullablePost {
      @PrimaryColumn({ type: 'varchar' })
      id!: string

      @ManyToOne(() => DemoUser, { nullable: true, createForeignKeyConstraints: false })
      author?: DemoUser
    }

    let connection: DataSource

    beforeAll(
      async () =>
        (connection = await new DataSource({
          type: 'better-sqlite3',
          database: ':memory:',
          synchronize: true,
          entities: [DemoUser, DemoRequiredPost, DemoNullablePost],
        }).initialize()),
    )

    afterAll(async () => connection.destroy())

    it('creates INNER JOIN for nullable: false relations', async () => {
      const query = connection
        .getRepository(DemoRequiredPost)
        .createQueryBuilder('post')
        .setFindOptions({ relations: { author: true } })
        .getQuery()
      expect(query).toContain('INNER JOIN')
      expect(query).not.toContain('LEFT JOIN')
    })

    it('still creates LEFT JOIN for nullable: true (default) relations', async () => {
      const query = connection
        .getRepository(DemoNullablePost)
        .createQueryBuilder('post')
        .setFindOptions({ relations: { author: true } })
        .getQuery()
      expect(query).toContain('LEFT JOIN')
      expect(query).not.toContain('INNER JOIN')
    })

    it('silently drops rows whose FK does not resolve when the relation is nullable: false', async () => {
      // no FK constraints => inserting an orphan FK (no matching user row) succeeds
      await connection.query(`INSERT INTO scratch_demo_required_post (id, authorUserId) VALUES ('orphan', 999)`)

      const posts = await connection.getRepository(DemoRequiredPost).find({ relations: { author: true } })
      expect(posts).toEqual([])
    })

    it('keeps rows whose FK does not resolve when the relation is nullable: true, as veramo entities do', async () => {
      await connection.query(`INSERT INTO scratch_demo_nullable_post (id, authorUserId) VALUES ('orphan', 999)`)

      const posts = await connection.getRepository(DemoNullablePost).find({ relations: { author: true } })
      expect(posts.length).toEqual(1)
      expect(posts[0].author).toEqual(null)
    })
  })

  describe('demonstration: where values that throw by default', () => {
    @Entity({ name: 'scratch_throw_post' })
    class DemoThrowPost {
      @PrimaryColumn({ type: 'varchar' })
      id!: string

      @Column({ nullable: true })
      title?: string
    }

    let throwingConnection: DataSource
    let ignoringConnection: DataSource

    beforeAll(async () => {
      const options = { type: 'better-sqlite3' as const, synchronize: true, entities: [DemoThrowPost] }
      throwingConnection = await new DataSource({ ...options, database: ':memory:' }).initialize()
      ignoringConnection = await new DataSource({
        ...options,
        database: ':memory:',
        invalidWhereValuesBehavior: { null: 'sql-null', undefined: 'ignore' },
      }).initialize()
      // both connections hold { id: 'untitled', title: null }
      await throwingConnection.query(`INSERT INTO scratch_throw_post (id, title) VALUES ('untitled', NULL)`)
      await ignoringConnection.query(`INSERT INTO scratch_throw_post (id, title) VALUES ('untitled', NULL)`)
    })

    afterAll(async () => {
      await throwingConnection.destroy()
      await ignoringConnection.destroy()
    })

    it('throws on undefined where values', async () => {
      await expect(
        throwingConnection.getRepository(DemoThrowPost).find({ where: { title: undefined } }),
      ).rejects.toThrow(/Undefined value encountered in property/)
    })

    it('throws on null where values (0.3 silently ignored them; match SQL NULL with IsNull())', async () => {
      await expect(
        // @ts-ignore
        throwingConnection.getRepository(DemoThrowPost).find({ where: { title: null } }),
      ).rejects.toThrow(/Null value encountered in property/)

      // the pre-upgrade intent, expressed the 1.0 way
      const [untitled] = await throwingConnection
        .getRepository(DemoThrowPost)
        .find({ where: { title: IsNull() } })
      expect(untitled?.title).toEqual(null)
    })

    it('reverts to 0.3 semantics with invalidWhereValuesBehavior options', async () => {
      const [untitled] = await ignoringConnection
        .getRepository(DemoThrowPost)
        // @ts-ignore
        .find({ where: { title: null } })
      expect(untitled?.title).toEqual(null)
      expect(untitled?.id).toEqual('untitled')
    })
  })
})
