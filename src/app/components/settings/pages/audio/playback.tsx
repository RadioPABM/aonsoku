import { useTranslation } from 'react-i18next'
import {
  Content,
  ContentItem,
  ContentItemForm,
  ContentItemTitle,
  ContentSeparator,
  Header,
  HeaderDescription,
  HeaderTitle,
  Root,
} from '@/app/components/settings/section'
import { Switch } from '@/app/components/ui/switch'
import { usePlaybackSettings } from '@/store/player.store'

export function PlaybackSettings() {
  const { t } = useTranslation()
  const { autoplayRecommended, setAutoplayRecommended } = usePlaybackSettings()

  return (
    <Root>
      <Header>
        <HeaderTitle>{t('settings.audio.playback.group')}</HeaderTitle>
        <HeaderDescription>
          {t('settings.audio.playback.description')}
        </HeaderDescription>
      </Header>
      <Content>
        <ContentItem>
          <ContentItemTitle
            info={t('settings.audio.playback.recommended.info')}
          >
            {t('settings.audio.playback.recommended.label')}
          </ContentItemTitle>
          <ContentItemForm>
            <Switch
              checked={autoplayRecommended}
              onCheckedChange={setAutoplayRecommended}
            />
          </ContentItemForm>
        </ContentItem>
      </Content>
      <ContentSeparator />
    </Root>
  )
}
