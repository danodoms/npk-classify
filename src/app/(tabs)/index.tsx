import { ExternalLink, Leaf } from '@tamagui/lucide-icons'
import { Anchor, H2, H1, Paragraph, XStack, YStack, Text, Button, Stack, SizableText, ListItem, ScrollView } from 'tamagui'
import { ToastControl } from 'src/app/CurrentToast'
import { Link } from "expo-router";
import * as Crypto from 'expo-crypto'
import { useSystem } from 'src/powersync/System';
import { RESULTS_TABLE, Result } from 'src/powersync/Schema';
import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';



export default function TabOneScreen() {
  const [result, setResult] = useState('');
  const { supabaseConnector, db } = useSystem();
  const [results, setResults] = useState<Result[]>([]);
  const [isTfReady, setIsTfReady] = useState(false); // Track TensorFlow readiness

  useEffect(() => {
    loadResults();
    initializeTensorFlow();
  }, []);

  const initializeTensorFlow = async () => {
    // Wait for TensorFlow to be ready
    await tf.ready();
    setIsTfReady(true);
  };

  const loadResults = async () => {
    const dbResults = await db.selectFrom(RESULTS_TABLE).selectAll().execute();
    setResults(dbResults);
  };

  const addResult = async () => {
    // const { userID } = await supabaseConnector.fetchCredentials();
    const resultId = Crypto.randomUUID();

    await db
      .insertInto(RESULTS_TABLE)
      .values({
        id: resultId,
        created_at: null,
        n_deficiency: 10,
        p_deficiency: 20,
        k_deficiency: 30,
        healthy: 40,
        timestamp: "1000",
        user_uuid: null
      })
      .execute();

    setResult('');
    loadResults();
  };


  // Reset the database
  const resetResults = async () => {
    await db.deleteFrom(RESULTS_TABLE).execute();
    loadResults();
  };



  return (
    <YStack f={1} ai="center" gap="$4" p="$4" borderColor="white" borderWidth={0}>

      {/* Loading TensorFlow message */}
      {!isTfReady ? (
        <Text>Loading TensorFlow...</Text>
      ) : (
        <Text>TensorFlow is ready to be used!</Text>
      )}

      <Stack borderColor="white" borderWidth={0} borderRadius="$4" width="100%" flex={1} backgroundColor='$accentBackground' padding="$4" justifyContent="flex-end">
        <H2 textAlign='left'>XtraRice</H2>
        <SizableText textAlign='left' size="$2">Classify Rice NPK deficiencies with your camera!</SizableText>
      </Stack>

      <Stack borderColor="white" borderWidth={0} width="100%" alignItems='center' flex={1} justifyContent='center'>
        <Link href="/Classify" className="text-center" >
          <Button backgroundColor="$accentBackground" onPress={addResult} iconAfter={Leaf} size="$6">Classify</Button>
        </Link>
      </Stack>

      {/* Reset Button */}
      <Button onPress={resetResults} backgroundColor="$dangerBackground" color="white">
        Reset Database
      </Button>

      {/* Dynamic Counter */}
      <SizableText textAlign='center' size="$4" color="$textColor" marginVertical="$2">
        Total Results: {results.length}
      </SizableText>


      {/* Render Results List */}
      <YStack width="100%" padding="$4" flex={1}>
        <ScrollView>
          {results.map((result) => (
            <ListItem key={result.id} padding="$2" backgroundColor="$background">
              <SizableText>N: {result.n_deficiency}</SizableText>
              <SizableText>P: {result.p_deficiency}</SizableText>
              <SizableText>K: {result.k_deficiency}</SizableText>
              <SizableText>Healthy: {result.healthy}</SizableText>
              <SizableText>Timestamp: {result.timestamp}</SizableText>
            </ListItem>
          ))}
        </ScrollView>
      </YStack>


    </YStack >
  )
}
