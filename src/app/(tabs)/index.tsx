import { ExternalLink, Leaf } from '@tamagui/lucide-icons'
import { Anchor, H2, Paragraph, XStack, YStack, Text, Button, Stack, SizableText } from 'tamagui'
import { ToastControl } from 'src/app/CurrentToast'
import { Link } from "expo-router";

export default function TabOneScreen() {
  return (
    <YStack f={1} ai="center" gap="$4" p="$4" display="flex" borderColor="white" borderWidth={0}>

      <Stack borderColor="white" borderWidth={1} backgroundColor="$green11Light" p="$4" borderRadius="$4">
        <H2 textAlign='left' >XtraRice AI</H2>
        <SizableText textAlign='left' size="$2">Classify Rice NPK deficiencies with your camera!</SizableText>
      </Stack>



      <Link href="/Classify" className="text-center">
        <Button variant='outlined' iconAfter={Leaf}>Classify</Button>
      </Link>


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
