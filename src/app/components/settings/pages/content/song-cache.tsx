import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
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
import { Button } from '@/app/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { Switch } from '@/app/components/ui/switch'
import {
  CACHE_LIMIT_OPTIONS,
  GIGABYTE,
  useCachedSongCount,
  useSongCacheActions,
  useSongCacheSettings,
  useSongCacheSize,
} from '@/store/song-cache.store'
import { formatBytes } from '@/utils/formatBytes'

export function SongCacheContent() {
  const { t } = useTranslation()
  const { limitBytes, autoCacheEnabled, autoCacheWifiOnly } =
    useSongCacheSettings()
  const { setLimitBytes, setAutoCacheEnabled, setAutoCacheWifiOnly, clear } =
    useSongCacheActions()
  const usedBytes = useSongCacheSize()
  const songCount = useCachedSongCount()
  const [isClearing, setIsClearing] = useState(false)

  async function handleClear() {
    if (isClearing) return

    setIsClearing(true)
    try {
      await clear()
      toast.success(t('settings.content.songCache.clear.success'))
    } catch {
      toast.error(t('settings.content.songCache.clear.error'))
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <Root>
      <Header>
        <HeaderTitle>{t('settings.content.songCache.group')}</HeaderTitle>
        <HeaderDescription>
          {t('settings.content.songCache.description')}
        </HeaderDescription>
      </Header>
      <Content>
        <ContentItem>
          <ContentItemTitle info={t('settings.content.songCache.auto.info')}>
            {t('settings.content.songCache.auto.label')}
          </ContentItemTitle>
          <ContentItemForm>
            <Switch
              checked={autoCacheEnabled}
              onCheckedChange={setAutoCacheEnabled}
            />
          </ContentItemForm>
        </ContentItem>

        <ContentItem>
          <ContentItemTitle info={t('settings.content.songCache.wifi.info')}>
            {t('settings.content.songCache.wifi.label')}
          </ContentItemTitle>
          <ContentItemForm>
            <Switch
              checked={autoCacheWifiOnly}
              onCheckedChange={setAutoCacheWifiOnly}
              disabled={!autoCacheEnabled}
            />
          </ContentItemForm>
        </ContentItem>

        <ContentItem>
          <ContentItemTitle info={t('settings.content.songCache.limit.info')}>
            {t('settings.content.songCache.limit.label')}
          </ContentItemTitle>
          <ContentItemForm>
            <Select
              value={limitBytes.toString()}
              onValueChange={(value) => setLimitBytes(Number(value))}
            >
              <SelectTrigger className="h-8 ring-offset-transparent focus:ring-0 focus:ring-transparent text-left">
                <SelectValue>
                  <span className="text-sm text-foreground">
                    {limitBytes / GIGABYTE} GB
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectGroup>
                  {CACHE_LIMIT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option / GIGABYTE} GB
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </ContentItemForm>
        </ContentItem>

        <ContentItem>
          <ContentItemTitle info={t('settings.content.songCache.clear.info')}>
            {t('settings.content.songCache.usage', {
              used: formatBytes(usedBytes),
              songs: songCount,
            })}
          </ContentItemTitle>
          <ContentItemForm>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClear}
              disabled={isClearing || songCount === 0}
            >
              {t('settings.content.songCache.clear.button')}
            </Button>
          </ContentItemForm>
        </ContentItem>
      </Content>
      <ContentSeparator />
    </Root>
  )
}
