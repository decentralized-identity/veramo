# Usage

Download config.js and docker-compose.yml and store in the same directory before launching the following commands:

## Pull latest docker image

```
docker pull uport/daf:latest
```

## Help

```
docker-compose run daf -h
```

## Create identity

```
docker-compose run daf identity-manager -c
```


## Start GraphQL server

```
docker-compose up -d
```

open http://localhost:8080

If you set `DAF_GRAPHQL_API_KEY` in `docker-compose.yml`, you will need to add HTTP `Authorization` header to your GraphQL API calls.
Example:

```
DAF_GRAPHQL_API_KEY=ABC123
```

```
{
  "Authorization": "Bearer ABC123"
}
```



## Stop

```
docker-compose down
```