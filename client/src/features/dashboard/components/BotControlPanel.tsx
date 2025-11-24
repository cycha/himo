import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Play,
  StopCircle,
  Activity,
  Database,
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2,
  Circle,
  AlertCircle,
} from 'lucide-react';
import { useBotStatus, useBotStats, useStartBotCron, useStopBotCron, useTriggerBotScrape } from '../../../hooks/api/useBot';
import { BotRunStatus } from '../../../types';

const BotControlPanel: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const { data: status, isLoading: statusLoading } = useBotStatus();
  const { data: stats, isLoading: statsLoading } = useBotStats();
  const startBotCron = useStartBotCron();
  const stopBotCron = useStopBotCron();
  const triggerScrape = useTriggerBotScrape();

  const handleStartCron = () => {
    startBotCron.mutate();
  };

  const handleStopCron = () => {
    stopBotCron.mutate();
  };

  const handleTriggerScrape = () => {
    triggerScrape.mutate();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (start?: string, end?: string) => {
    if (!start) return 'N/A';
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);

    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  if (statusLoading || statsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('bot.title')}
          </CardTitle>
          <CardDescription>{t('bot.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bot Status & Controls */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t('bot.title')}
                </CardTitle>
                <CardDescription>{t('bot.description')}</CardDescription>
              </div>
            </div>

            {/* Status Indicators Row */}
            <div className="flex items-center gap-6 text-sm border-t pt-4">
              {/* Bot Service Status */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">{t('bot.indicators.service')}:</span>
                {status?.serviceHealthy ? (
                  <Badge variant="outline" className="gap-1.5 bg-green-50 text-green-700 border-green-200">
                    <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                    {t('bot.indicators.online')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1.5 bg-red-50 text-red-700 border-red-200">
                    <AlertCircle className="h-3 w-3" />
                    {t('bot.indicators.offline')}
                  </Badge>
                )}
              </div>

              {/* Scheduler Status */}
              {status?.serviceHealthy && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">{t('bot.indicators.scheduler')}:</span>
                  {status.cronSchedulerActive ? (
                    <Badge variant="outline" className="gap-1.5 bg-blue-50 text-blue-700 border-blue-200">
                      <Circle className="h-2 w-2 fill-blue-500 text-blue-500 animate-pulse" />
                      {t('bot.indicators.running')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1.5">
                      <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
                      {t('bot.indicators.stopped')}
                    </Badge>
                  )}
                </div>
              )}

              {/* Current Task Status */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">{t('bot.indicators.task')}:</span>
                {status?.isRunning ? (
                  <Badge variant="outline" className="gap-1.5 bg-orange-50 text-orange-700 border-orange-200">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t('bot.indicators.scraping')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1.5">
                    <CheckCircle className="h-3 w-3 text-muted-foreground" />
                    {t('bot.indicators.idle')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Cron Scheduler Control */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t('bot.cron.title')}</h4>
              {status?.cronSchedulerActive ? (
                <Button
                  onClick={handleStopCron}
                  disabled={stopBotCron.isPending}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  {stopBotCron.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('bot.cron.stopping')}
                    </>
                  ) : (
                    <>
                      <StopCircle className="h-4 w-4 mr-2" />
                      {t('bot.cron.stop')}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleStartCron}
                  disabled={startBotCron.isPending || !status?.serviceHealthy}
                  className="w-full"
                  size="sm"
                >
                  {startBotCron.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('bot.cron.starting')}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {t('bot.cron.start')}
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Manual Trigger */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t('bot.manual.title')}</h4>
              <Button
                onClick={handleTriggerScrape}
                disabled={status?.isRunning || triggerScrape.isPending}
                variant="secondary"
                className="w-full"
              >
                {triggerScrape.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('bot.manual.triggering')}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {t('bot.manual.trigger')}
                  </>
                )}
              </Button>
            </div>

            {/* Current/Last Run Info */}
            {(status?.currentRun || status?.lastRun) && (
              <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
                <h4 className="font-semibold text-sm">
                  {status.isRunning ? t('bot.currentRun') : t('bot.lastRun')}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('bot.details.started')}:</span>
                    <p className="font-medium">
                      {formatDate(status.currentRun?.startTime || status.lastRun?.startTime)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('bot.details.duration')}:</span>
                    <p className="font-medium">
                      {formatDuration(
                        status.currentRun?.startTime || status.lastRun?.startTime,
                        status.currentRun?.endTime || status.lastRun?.endTime
                      )}
                    </p>
                  </div>
                  {!status.isRunning && status.lastRun?.adsSaved != null && (
                    <>
                      <div>
                        <span className="text-muted-foreground">{t('bot.details.adsSaved')}:</span>
                        <p className="font-medium">{status.lastRun.adsSaved}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('bot.details.pages')}:</span>
                        <p className="font-medium">{status.lastRun.pagesScraped || 0}</p>
                      </div>
                    </>
                  )}
                </div>
                {status.lastRun?.errorMessage && (
                  <div className="mt-2">
                    <span className="text-destructive text-sm">
                      {t('bot.details.error')}: {status.lastRun.errorMessage}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('bot.stats.totalAds')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {stats.totalAdsInDatabase.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('bot.stats.totalRuns')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.totalRuns}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.successfulRuns} {t('bot.stats.successful')}, {stats.failedRuns}{' '}
                {t('bot.stats.failed')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('bot.stats.totalScraped')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.totalAdsSaved.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('bot.stats.averagePerRun')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {Math.round(stats.averageAdsSavedPerRun)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('bot.stats.adsPerRun')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Runs */}
      {stats?.recentRuns && stats.recentRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('bot.recentRuns.title')}</CardTitle>
            <CardDescription>{t('bot.recentRuns.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {run.status === BotRunStatus.Completed && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {run.status === BotRunStatus.Failed && (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    {run.status === BotRunStatus.Running && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                    {run.status === BotRunStatus.Stopped && (
                      <StopCircle className="h-4 w-4 text-orange-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{formatDate(run.startTime)}</p>
                      <p className="text-xs text-muted-foreground">
                        {run.triggeredBy === 'cron'
                          ? t('bot.recentRuns.automated')
                          : t('bot.recentRuns.manual')}
                        {run.adsSaved != null &&
                          ` • ${run.adsSaved} ${t('bot.details.adsSaved').toLowerCase()}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDuration(run.startTime, run.endTime)}
                    </p>
                    {run.pagesScraped != null && (
                      <p className="text-xs text-muted-foreground">
                        {run.pagesScraped} {t('bot.details.pages').toLowerCase()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BotControlPanel;
