/**
 * Sample React Native Daf App
 * https://github.com/facebook/react-native
 *
 * Generated with the Daf TypeScript template
 * https://github.com/uport-project/daf
 *
 * @format
 */

import React, { useState, useEffect } from 'react'
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar, Button } from 'react-native'

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen'

import * as Daf from 'daf-core'
import { core, dataStore, db } from './setup'

core.on(Daf.EventTypes.validatedMessage, async (message: Daf.Message) => {
  await dataStore.saveMessage(message)
})

declare var global: { HermesInternal: null | {} }

const App = () => {
  const [identities, setDids] = useState()

  const syncDaf = async () => {
    await db.initialize()
    await dataStore.initialize()
    await core.setupServices()
    await core.listen()
  }

  const getDids = async () => {
    const dids = await core.identityManager.listDids()
    setDids(dids)
  }

  useEffect(() => {
    syncDaf()
  }, [])

  useEffect(() => {
    getDids()
  }, [identities])

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
          <Header />
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Daf Stuff</Text>
              <Button onPress={() => core.identityManager.create('rnEthr')} title={'Create Identity'}>
                Create Identity
              </Button>
              {identities?.map((did: string) => (
                <Text key={did}>{did}</Text>
              ))}
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Step One</Text>
              <Text style={styles.sectionDescription}>
                Edit <Text style={styles.highlight}>App.tsx</Text> to change this screen and then come back to
                see your edits.
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>See Your Changes</Text>
              <Text style={styles.sectionDescription}>
                <ReloadInstructions />
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Debug</Text>
              <Text style={styles.sectionDescription}>
                <DebugInstructions />
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Learn More</Text>
              <Text style={styles.sectionDescription}>Read the docs to discover what to do next:</Text>
            </View>
            <LearnMoreLinks />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
})

export default App
