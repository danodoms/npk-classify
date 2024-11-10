import { ExternalLink, Leaf } from '@tamagui/lucide-icons'
import { Anchor, H2, H1, Paragraph, XStack, YStack, Text, Button, Stack, SizableText, ListItem } from 'tamagui'
import { ToastControl } from 'src/app/CurrentToast'
import { Link } from "expo-router";
import * as Crypto from 'expo-crypto'
import { useSystem } from 'src/powersync/System';
import { RESULTS_TABLE, Result } from 'src/powersync/Schema';
import { useState, useEffect } from 'react';


export default function TabOneScreen() {
  const [result, setResult] = useState('');
  const { supabaseConnector, db } = useSystem();
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    loadResults();
  }, []);

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

  // addResult();
  // addResult();
  // addResult();



  return (
    <YStack f={1} ai="center" gap="$4" p="$4" borderColor="white" borderWidth={0}>

      <Stack borderColor="white" borderWidth={0} borderRadius="$4" width="100%" flex={1} backgroundColor='$accentBackground' padding="$4" justifyContent="flex-end">
        <H2 textAlign='left'>XtraRice</H2>
        <SizableText textAlign='left' size="$2">Classify Rice NPK deficiencies with your camera!</SizableText>
      </Stack>

      <Stack borderColor="white" borderWidth={0} width="100%" alignItems='center' flex={1} justifyContent='center'>
        <Link href="/Classify" className="text-center" >
          <Button backgroundColor="$accentBackground" iconAfter={Leaf} size="$6">Classify</Button>
        </Link>
      </Stack>


      {/* Render Results List */}
      <YStack width="100%" padding="$4">
        {results.map((result) => (
          <ListItem key={result.id} padding="$2" backgroundColor="$background">
            {/* <SizableText>ID: {result.id}</SizableText> */}
            <SizableText>N {result.n_deficiency}</SizableText>
            <SizableText>P {result.p_deficiency}</SizableText>
            <SizableText>K {result.k_deficiency}</SizableText>
            <SizableText>Healthy: {result.healthy}</SizableText>
            <SizableText>Timestamp: {result.timestamp}</SizableText>
          </ListItem>
        ))}
      </YStack>





      {/* <ToastControl /> */}

      {/* <XStack ai="center" jc="center" fw="wrap" gap="$1.5" pos="absolute" b="$8">
        <Paragraph fos="$5">Add</Paragraph>

        <Paragraph fos="$5" px="$2" py="$1" col="$blue10" bg="$blue5" br="$3">
          tamagui.config.ts
        </Paragraph>

        <Paragraph fos="$5">to root and follow the</Paragraph>

        <XStack
          ai="center"
          gap="$1.5"
          px="$2"
          py="$1"
          br="$3"
          bg="$purple5"
          hoverStyle={{ bg: '$purple6' }}
          pressStyle={{ bg: '$purple4' }}
        >
          <Anchor
            href="https://tamagui.dev/docs/core/configuration"
            textDecorationLine="none"
            col="$purple10"
            fos="$5"
          >
            Configuration guide
          </Anchor>
          <ExternalLink size="$1" col="$purple10" />
        </XStack>

        <Paragraph fos="$5" ta="center">
          to configure your themes and tokens.
        </Paragraph>


      </XStack> */}


    </YStack >
  )
}
