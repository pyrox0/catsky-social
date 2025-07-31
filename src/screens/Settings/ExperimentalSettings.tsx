import {useState} from 'react'
import {StyleSheet, View} from 'react-native'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {type NativeStackScreenProps} from '@react-navigation/native-stack'

import {type CommonNavigatorParams} from '#/lib/routes/types'
import {type Gate} from '#/lib/statsig/gates'
import {
  resetCatskyGateCache,
  useDangerousSetGate,
  useGatesCache,
} from '#/lib/statsig/statsig'
import {isWeb} from '#/platform/detection'
import * as persisted from '#/state/persisted'
import {useGoLinksEnabled, useSetGoLinksEnabled} from '#/state/preferences'
import {
  useConstellationEnabled,
  useSetConstellationEnabled,
} from '#/state/preferences/constellation-enabled'
import {
  useCustomShareLink,
  useSetCustomShareLink,
} from '#/state/preferences/custom-share-link'
import {
  useDirectFetchRecords,
  useSetDirectFetchRecords,
} from '#/state/preferences/direct-fetch-records'
import {
  useSetShowExternalShareButtons,
  useShowExternalShareButtons,
} from '#/state/preferences/external-share-buttons'
import * as SettingsList from '#/screens/Settings/components/SettingsList'
import {atoms as a, useTheme} from '#/alf'
import {Admonition} from '#/components/Admonition'
import {Button, ButtonText} from '#/components/Button'
import * as Dialog from '#/components/Dialog'
import * as Toggle from '#/components/forms/Toggle'
import {Atom_Stroke2_Corner0_Rounded as ExperimentalIcon} from '#/components/icons/Atom'
import {ChainLink_Stroke2_Corner0_Rounded as ChainLinkIcon} from '#/components/icons/ChainLink'
import {Eye_Stroke2_Corner0_Rounded as VisibilityIcon} from '#/components/icons/Eye'
import {PaintRoller_Stroke2_Corner2_Rounded as PaintRollerIcon} from '#/components/icons/PaintRoller'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'

type Props = NativeStackScreenProps<CommonNavigatorParams>

export function ExperimentalSettingsScreen({}: Props) {
  const {_} = useLingui()

  const goLinksEnabled = useGoLinksEnabled()
  const setGoLinksEnabled = useSetGoLinksEnabled()

  const constellationEnabled = useConstellationEnabled()
  const setConstellationEnabled = useSetConstellationEnabled()

  const directFetchRecords = useDirectFetchRecords()
  const setDirectFetchRecords = useSetDirectFetchRecords()

  const showExternalShareButtons = useShowExternalShareButtons()
  const setShowExternalShareButtons = useSetShowExternalShareButtons()

  const customShareLink = useCustomShareLink() ?? 'https://catsky.social/'
  const setCustomShareLink = Dialog.useDialogControl()

  const [gates, setGatesView] = useState(Object.fromEntries(useGatesCache()))
  const dangerousSetGate = useDangerousSetGate()
  const setGate = (gate: Gate, value: boolean) => {
    dangerousSetGate(gate, value)
    setGatesView({
      ...gates,
      [gate]: value,
    })
  }

  function CustomShareLinkDialog({
    control,
  }: {
    control: Dialog.DialogControlProps
  }) {
    const {_} = useLingui()
    const t = useTheme()
    const customShareLink = useCustomShareLink()
    const setCustomShareLink = useSetCustomShareLink()
    const [url, setUrl] = useState(customShareLink ?? '')
    const shouldDisable = () => {
      try {
        return !new URL(url).hostname.includes('.')
      } catch (e) {
        try {
          return !new URL('https://' + url).hostname.includes('.')
        } catch (e) {
          return true
        }
      }
    }
    const parseUrl = () => {
      try {
        return new URL(url).toString()
      } catch (e) {
        try {
          return new URL('https://' + url).toString()
        } catch (e) {
          return undefined
        }
      }
    }
    const submit = () => {
      if (shouldDisable()) return // Prevents errors on enter key pressed
      setCustomShareLink(parseUrl())
      control.close()
    }

    return (
      <Dialog.Outer control={control} nativeOptions={{preventExpansion: true}}>
        <Dialog.Handle />
        <Dialog.ScrollableInner label={_(msg`Custom share link URL`)}>
          <View style={[a.gap_sm, a.pb_lg]}>
            <Text style={[a.text_2xl, a.font_bold]}>
              <Trans>Custom share link URL</Trans>
            </Text>
          </View>
          <View style={a.gap_lg}>
            <Dialog.Input
              label="Text input field"
              autoFocus
              style={[
                styles.textInput,
                t.atoms.border_contrast_low,
                t.atoms.text,
              ]}
              defaultValue={url}
              onChangeText={value => {
                setUrl(value)
              }}
              placeholder={persisted.defaults.customShareLink}
              placeholderTextColor={t.atoms.text.color}
              onSubmitEditing={submit}
              accessibilityHint={_(msg`Set custom base url for share links`)}
            />
            <View style={isWeb && [a.flex_row, a.justify_end]}>
              <Button
                label={_(msg`Save`)}
                size="large"
                onPress={submit}
                disabled={shouldDisable()}
                color="primary">
                <ButtonText>
                  <Trans>Save</Trans>
                </ButtonText>
              </Button>
            </View>
          </View>
          <Dialog.Close />
        </Dialog.ScrollableInner>
      </Dialog.Outer>
    )
  }

  const t = useTheme()

  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Experimental</Trans>
          </Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>
      <Layout.Content>
        <SettingsList.Container>
          <SettingsList.Group contentContainerStyle={[a.gap_sm]}>
            <SettingsList.ItemIcon icon={ExperimentalIcon} />
            <SettingsList.ItemText>
              <Trans>Redirects</Trans>
            </SettingsList.ItemText>
            <Toggle.Item
              name="use_go_links"
              label={_(msg`Redirect through go.bsky.app`)}
              value={goLinksEnabled ?? false}
              onChange={value => setGoLinksEnabled(value)}
              style={[a.w_full]}>
              <Toggle.LabelText style={[a.flex_1]}>
                <Trans>Redirect through go.bsky.app</Trans>
              </Toggle.LabelText>
              <Toggle.Platform />
            </Toggle.Item>
          </SettingsList.Group>

          <SettingsList.Group contentContainerStyle={[a.gap_sm]}>
            <SettingsList.ItemIcon icon={VisibilityIcon} />
            <SettingsList.ItemText>
              <Trans>Visibility</Trans>
            </SettingsList.ItemText>
            <Toggle.Item
              name="direct_fetch_records"
              label={_(
                msg`FIXME: Fetch records directly from PDS to see through quote blocks`,
              )}
              value={directFetchRecords}
              onChange={value => setDirectFetchRecords(value)}
              style={[a.w_full]}>
              <Toggle.LabelText style={[a.flex_1]}>
                <Trans>
                  FIXME: Fetch records directly from PDS to see through quote
                  blocks
                </Trans>
              </Toggle.LabelText>
              <Toggle.Platform />
            </Toggle.Item>
            <Toggle.Item
              name="constellation_fallback"
              label={_(
                msg`Fall back to constellation api to find blocked replies`,
              )}
              disabled={true}
              value={constellationEnabled}
              onChange={value => setConstellationEnabled(value)}
              style={[a.w_full]}>
              <Toggle.LabelText style={[a.flex_1]}>
                <Trans>
                  TODO: Fall back to constellation api to find blocked replies
                </Trans>
              </Toggle.LabelText>
              <Toggle.Platform />
            </Toggle.Item>
          </SettingsList.Group>

          <SettingsList.Group contentContainerStyle={[a.gap_sm]}>
            <SettingsList.ItemIcon icon={ChainLinkIcon} />
            <SettingsList.ItemText>
              <Trans>Bridging and Fediverse</Trans>
            </SettingsList.ItemText>
            <Toggle.Item
              name="external_share_buttons"
              label={_(
                msg`Show "Open original post" and "Open post in PDSls" buttons`,
              )}
              value={showExternalShareButtons}
              onChange={value => setShowExternalShareButtons(value)}
              style={[a.w_full]}>
              <Toggle.LabelText style={[a.flex_1]}>
                <Trans>
                  Show "Open original post" and "Open post in PDSls" buttons
                </Trans>
              </Toggle.LabelText>
              <Toggle.Platform />
            </Toggle.Item>
          </SettingsList.Group>

          <SettingsList.Item>
            <SettingsList.ItemIcon icon={ChainLinkIcon} />
            <SettingsList.ItemText>
              <Trans>{`Share url:`} </Trans>
              {` `}
              <Text style={[a.text_md, {color: t.palette.contrast_500}]}>
                {customShareLink}
              </Text>
            </SettingsList.ItemText>
            <SettingsList.BadgeButton
              label={_(msg`Change`)}
              onPress={() => setCustomShareLink.open()}
            />
          </SettingsList.Item>

          <SettingsList.Group contentContainerStyle={[a.gap_sm]}>
            <SettingsList.ItemIcon icon={PaintRollerIcon} />
            <SettingsList.ItemText>
              <Trans>Tweaks</Trans>
            </SettingsList.ItemText>
            <Toggle.Item
              name="under construction"
              label={_(msg`🚧 under construction...`)}
              value={false}
              onChange={() => {}}
              disabled={true}
              style={[a.w_full]}>
              <Toggle.LabelText style={[a.flex_1]}>
                <Trans>🚧 under construction...</Trans>
              </Toggle.LabelText>
              <Toggle.Platform />
            </Toggle.Item>
          </SettingsList.Group>

          <SettingsList.Group contentContainerStyle={[a.gap_sm]}>
            <SettingsList.ItemIcon icon={PaintRollerIcon} />
            <SettingsList.ItemText>
              <Trans>Gates</Trans>
            </SettingsList.ItemText>
            {Object.entries(gates).map(([gate, status]) => (
              <Toggle.Item
                key={gate}
                name={gate}
                label={gate}
                value={status}
                onChange={value => setGate(gate as Gate, value)}
                style={[a.w_full]}>
                <Toggle.LabelText style={[a.flex_1]}>{gate}</Toggle.LabelText>
                <Toggle.Platform />
              </Toggle.Item>
            ))}
            <SettingsList.BadgeButton
              label={_(msg`Reset gates`)}
              onPress={() => {
                resetCatskyGateCache()
                setGatesView({})
              }}
            />
          </SettingsList.Group>

          <SettingsList.Item>
            <Admonition type="warning" style={[a.flex_1]}>
              <Trans>
                These settings might summon nasel demons! Restart the app after
                changing if anything breaks.
              </Trans>
            </Admonition>
          </SettingsList.Item>
        </SettingsList.Container>
      </Layout.Content>
      <CustomShareLinkDialog control={setCustomShareLink} />
    </Layout.Screen>
  )
}

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 20,
    marginHorizontal: 20,
  },
})
