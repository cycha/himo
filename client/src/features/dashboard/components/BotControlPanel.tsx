import React from 'react';
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
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useBotStatus, useBotStats, useStartBot, useStopBot } from '../../../hooks/api/useBot';
import { BotRunStatus } from '../../../types';

const BotControlPanel: React.FC = () => {
  const { data: status, isLoading: statusLoading } = useBotStatus();
  const { data: stats, isLoading: statsLoading } = useBotStats();
  const startBot = useStartBot();
  const stopBot = useStopBot();

  const handleStart = () => {
    startBot.mutate();
  };

  const handleStop = () => {
    stopBot.mutate();
  };

  const getStatusBadge = () => {
    if (!status) return null;

    if (status.isRunning) {
      return (
        <Badge variant="default" className="bg-green-600">
          <Activity className="h-3 w-3 mr-1" />
          Running
        </Badge>
      );
    }

    if (status.lastRun?.status === BotRunStatus.Completed) {
      return (
        <Badge variant="secondary">
          <CheckCircle className="h-3 w-3 mr-1" />
          Idle
        </Badge>
      );
    }

    if (status.lastRun?.status === BotRunStatus.Failed) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }

    return (
      <Badge variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        Ready
      </Badge>
    );
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
            Scraping Bot Controls
          </CardTitle>
          <CardDescription>Manage and monitor the real estate scraper</CardDescription>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Scraping Bot Controls
              </CardTitle>
              <CardDescription>Manage and monitor the real estate scraper</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Control Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleStart}
                disabled={status?.isRunning || startBot.isPending}
                className="flex-1"
              >
                {startBot.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Bot
                  </>
                )}
              </Button>
              <Button
                onClick={handleStop}
                disabled={!status?.isRunning || stopBot.isPending}
                variant="destructive"
                className="flex-1"
              >
                {stopBot.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop Bot
                  </>
                )}
              </Button>
            </div>

            {/* Current/Last Run Info */}
            {(status?.currentRun || status?.lastRun) && (
              <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
                <h4 className="font-semibold text-sm">
                  {status.isRunning ? 'Current Run' : 'Last Run'}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Started:</span>
                    <p className="font-medium">
                      {formatDate(status.currentRun?.start_time || status.lastRun?.start_time)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">
                      {formatDuration(
                        status.currentRun?.start_time || status.lastRun?.start_time,
                        status.currentRun?.end_time || status.lastRun?.end_time
                      )}
                    </p>
                  </div>
                  {!status.isRunning && (status.lastRun?.ads_saved !== undefined) && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Ads Saved:</span>
                        <p className="font-medium">{status.lastRun.ads_saved}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pages:</span>
                        <p className="font-medium">{status.lastRun.pages_scraped || 0}</p>
                      </div>
                    </>
                  )}
                </div>
                {status.lastRun?.error_message && (
                  <div className="mt-2">
                    <span className="text-destructive text-sm">Error: {status.lastRun.error_message}</span>
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
                Total Ads in Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.totalAdsInDatabase.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.totalRuns}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.successfulRuns} successful, {stats.failedRuns} failed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Ads Scraped
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
                Average per Run
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{Math.round(stats.averageAdsSavedPerRun)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">ads per run</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Runs */}
      {stats?.recentRuns && stats.recentRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Runs</CardTitle>
            <CardDescription>Last 10 bot executions</CardDescription>
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
                      <p className="text-sm font-medium">
                        {formatDate(run.start_time)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {run.triggered_by === 'cron' ? 'Automated' : 'Manual'}
                        {run.ads_saved !== undefined && ` • ${run.ads_saved} ads saved`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDuration(run.start_time, run.end_time)}
                    </p>
                    {run.pages_scraped !== undefined && (
                      <p className="text-xs text-muted-foreground">{run.pages_scraped} pages</p>
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
