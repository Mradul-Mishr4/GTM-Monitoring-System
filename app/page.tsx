"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tag } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Play,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Layers,
  Cpu,
  FileText,
  BarChart2,
} from "lucide-react";

// -----------------------------
// Types
// -----------------------------
interface GtmMetric {
  containerId: string;
  totalCpuTime: number;
  scriptEvaluation: number;
  scriptParseTime: number;
}

interface AuditResult {
  url: string;
  status: "success" | "error";
  error?: string;
  gtmMetrics: GtmMetric[];
}

interface AuditSummary {
  totalUrls: number;
  successfulAudits: number;
  totalContainers: number;
  averageCpuTime: number;
  averageScriptEval: number;
  averageParseTime: number;
}

// -----------------------------
// Component
// -----------------------------
export default function GTMMonitoringSystem() {
  const [urls, setUrls] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentUrl, setCurrentUrl] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalUrls, setTotalUrls] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);
  const [results, setResults] = useState<AuditResult[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [error, setError] = useState("");

  // -------------------------
  // Helpers
  // -------------------------
  const validateUrls = (urlList: string[]): string[] => {
    const urlRegex = /^https?:\/\/.+/;
    return urlList.filter((url) => {
      const trimmed = url.trim();
      return trimmed && urlRegex.test(trimmed);
    });
  };

  const getPerformanceStatus = (
    value: number,
    metric: "cpu" | "script"
  ): "good" | "warning" | "critical" => {
    const thresholds = {
      cpu: { warning: 500, critical: 1000 },
      script: { warning: 200, critical: 500 },
    } as const;

    const threshold = thresholds[metric];
    if (value <= threshold.warning) return "good";
    if (value <= threshold.critical) return "warning";
    return "critical";
  };

  const getStatusColor = (status: "good" | "warning" | "critical"): string => {
    switch (status) {
      case "good":
        return "bg-green-700/20 text-green-300";
      case "warning":
        return "bg-yellow-600/20 text-yellow-300";
      case "critical":
        return "bg-red-700/20 text-red-300";
    }
  };

  const calculateSummary = (results: AuditResult[]): AuditSummary => {
    const successfulResults = results.filter((r) => r.status === "success");
    const allGtmMetrics = successfulResults.flatMap((r) => r.gtmMetrics);
    const totalContainers = allGtmMetrics.length;

    if (totalContainers === 0) {
      return {
        totalUrls: results.length,
        successfulAudits: successfulResults.length,
        totalContainers: 0,
        averageCpuTime: 0,
        averageScriptEval: 0,
        averageParseTime: 0,
      };
    }

    const mean = (arr: number[]) =>
      arr.reduce((sum, v) => sum + v, 0) / arr.length;

    return {
      totalUrls: results.length,
      successfulAudits: successfulResults.length,
      totalContainers,
      averageCpuTime: mean(allGtmMetrics.map((m) => m.totalCpuTime)),
      averageScriptEval: mean(allGtmMetrics.map((m) => m.scriptEvaluation)),
      averageParseTime: mean(allGtmMetrics.map((m) => m.scriptParseTime)),
    };
  };

  // -------------------------
  // Actions
  // -------------------------
  const startAudit = useCallback(async () => {
    setError("");
    const urlList = urls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    const validUrls = validateUrls(urlList);

    if (validUrls.length === 0) {
      setError(
        "Please enter at least one valid URL (starting with http:// or https://)"
      );
      return;
    }

    if (validUrls.length !== urlList.length) {
      setError(
        `${
          urlList.length - validUrls.length
        } invalid URLs removed. Only valid URLs will be audited.`
      );
    }

    setIsAuditing(true);
    setProgress(0);
    setResults([]);
    setSummary(null);
    setTotalUrls(validUrls.length);
    setEstimatedTimeRemaining(validUrls.length * 20);

    const newResults: AuditResult[] = [];
    const startTime = Date.now();

    for (let i = 0; i < validUrls.length; i++) {
      const url = validUrls[i];
      setCurrentUrl(url);
      setCurrentIndex(i + 1);

      const elapsed = (Date.now() - startTime) / 1000;
      const avgPerUrl = elapsed / (i + 1);
      setEstimatedTimeRemaining(
        Math.max(0, Math.round((validUrls.length - i - 1) * avgPerUrl))
      );

      try {
        const response = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const result: AuditResult = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `HTTP ${response.status}`);
        }

        newResults.push(result);
      } catch (err) {
        newResults.push({
          url,
          gtmMetrics: [],
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }

      setProgress(((i + 1) / validUrls.length) * 100);
    }

    setResults(newResults);
    setSummary(calculateSummary(newResults));
    setIsAuditing(false);
    setCurrentUrl("");
    setEstimatedTimeRemaining(0);
  }, [urls]);

  const exportToCSV = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `GTM Monitoring System ${timestamp}.csv`;

    const headers = [
      "URL",
      "Container ID",
      "Total CPU Time (ms)",
      "Script Evaluation (ms)",
      "Script Parse Time (ms)",
      "Status",
      "Error",
    ];

    const rows = results.flatMap((result) => {
      if (result.status === "error" || result.gtmMetrics.length === 0) {
        return [
          [
            `"${result.url}"`,
            "-",
            "-",
            "-",
            "-",
            result.status,
            `"${result.error || ""}"`,
          ].join(","),
        ];
      }
      return result.gtmMetrics.map((metric) =>
        [
          `"${result.url}"`,
          metric.containerId,
          metric.totalCpuTime,
          metric.scriptEvaluation,
          metric.scriptParseTime,
          result.status,
          '""',
        ].join(",")
      );
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearResults = () => {
    setUrls("");
    setResults([]);
    setSummary(null);
    setError("");
    setProgress(0);
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="min-h-screen bg-slate-900 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">GTM Monitoring System</h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Monitor Google Tag Manager efficiency with detailed CPU and script
            analysis.
          </p>
        </div>

        {/* URL Input */}
        <Card className="bg-slate-800 border-slate-700 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white">
              <Play className="w-5 h-5 text-blue-400" /> Enter URLs
            </CardTitle>
            <CardDescription className="text-slate-400">
              Input URLs one per line (http:// or https://)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="https://example.com"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="min-h-32 resize-none font-mono bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500"
              disabled={isAuditing}
            />
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={startAudit}
                disabled={isAuditing || !urls.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isAuditing ? "Auditing..." : "Start Audit"}
              </Button>
              {(results.length > 0 || error) && (
                <Button
                  variant="outline"
                  onClick={clearResults}
                  disabled={isAuditing}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert className="bg-red-900/20 border-red-700/50 text-red-300">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        {isAuditing && (
          <Card className="bg-slate-800 border-slate-700 shadow-lg">
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400 animate-spin" />
                  Audit in Progress
                </div>
                <Badge
                  variant="secondary"
                  className=" bg-blue-400 mt-2 px-3 py-1"
                >
                  {currentIndex} / {totalUrls}
                </Badge>
              </div>
              <Progress
                value={progress}
                className="h-2 bg-slate-700 [&>div]:bg-blue-500"
              />
              <div className="flex justify-between text-sm text-slate-400 mt-1">
                <span>
                  Currently auditing:{" "}
                  <span className="font-mono text-blue-400">{currentUrl}</span>
                </span>
                <span>ETA: {formatTime(estimatedTimeRemaining)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {summary && (
          <Card className="bg-slate-800 border-slate-700 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-green-400" /> Audit Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <SummaryCard
                label="Total URLs"
                value={summary.totalUrls}
                color="blue"
                icon={Layers}
              />
              <SummaryCard
                label="Successful"
                value={summary.successfulAudits}
                color="green"
                icon={CheckCircle}
              />
              <SummaryCard
                label="Containers"
                value={summary.totalContainers}
                color="indigo"
                icon={BarChart2}
              />
              <SummaryCard
                label="Avg CPU"
                value={`${summary.averageCpuTime}ms`}
                color="purple"
                icon={Cpu}
              />
              <SummaryCard
                label="Avg Script Eval"
                value={`${summary.averageScriptEval}ms`}
                color="orange-400" // brighter orange
                icon={FileText}
              />
              <SummaryCard
                label="Avg Parse"
                value={`${summary.averageParseTime}ms`}
                color="teal-400" // brighter teal
                icon={FileText}
              />
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 shadow-lg">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-white">Audit Results</CardTitle>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" /> CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Container ID</TableHead>
                      <TableHead className="text-center">CPU</TableHead>
                      <TableHead className="text-center">Eval</TableHead>
                      <TableHead className="text-center">Parse</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, idx) =>
                      result.status === "success" &&
                      result.gtmMetrics.length > 0 ? (
                        result.gtmMetrics.map((metric, mIdx) => (
                          <TableRow
                            key={`${idx}-${mIdx}`}
                            className="hover:bg-slate-700/30"
                          >
                            <TableCell
                              className="font-mono text-sm max-w-xs truncate text-slate-100 font-medium"
                              title={result.url}
                            >
                              {mIdx === 0 ? result.url : ""}
                            </TableCell>

                            <TableCell className="font-mono text-sm text-slate-100 font-medium">
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-indigo-400" />
                                {metric.containerId}
                              </div>
                            </TableCell>

                            <TableCell
                              className={`text-center ${getStatusColor(
                                getPerformanceStatus(metric.totalCpuTime, "cpu")
                              )}`}
                            >
                              {metric.totalCpuTime}
                            </TableCell>
                            <TableCell
                              className={`text-center ${getStatusColor(
                                getPerformanceStatus(
                                  metric.scriptEvaluation,
                                  "script"
                                )
                              )}`}
                            >
                              {metric.scriptEvaluation}
                            </TableCell>
                            <TableCell
                              className={`text-center ${getStatusColor(
                                getPerformanceStatus(
                                  metric.scriptParseTime,
                                  "script"
                                )
                              )}`}
                            >
                              {metric.scriptParseTime}
                            </TableCell>
                            <TableCell className="text-center">
                              {mIdx === 0 && (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-700 text-green-100"
                                >
                                  Success
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow key={idx} className="bg-red-900/20">
                          <TableCell
                            className="font-mono text-sm max-w-xs truncate text-slate-400"
                            title={result.url}
                          >
                            {result.url}
                          </TableCell>
                          <TableCell
                            colSpan={4}
                            className="text-center text-red-300"
                          >
                            {result.error || "Audit failed"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="destructive">Error</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Performance Legend */}

        <Card className="bg-slate-900 border border-slate-700 shadow-sm">
          <CardContent>
            <h4 className="text-lg font-semibold text-slate-100 mb-4 mt-2">
              Performance Standards :
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-200">
              {/* CPU Time */}
              <div className="space-y-2">
                <div className="font-medium text-slate-100">CPU Time</div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  ≤500ms: Good
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  501-1000ms: Warning
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  &gt;1000ms: Critical
                </div>
              </div>

              {/* Script Times */}
              <div className="space-y-2">
                <div className="font-medium text-slate-100">
                  Script Times (Evaluation / Parse)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  ≤200ms: Good
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  201-500ms: Warning
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  &gt;500ms: Critical
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-700/20", text: "text-blue-400" },
  green: { bg: "bg-green-700/20", text: "text-green-400" },
  orange: { bg: "bg-orange-700/20", text: "text-orange-400" },
  teal: { bg: "bg-teal-700/20", text: "text-teal-400" },
  purple: { bg: "bg-purple-700/20", text: "text-purple-400" },
  indigo: { bg: "bg-indigo-700/20", text: "text-indigo-400" },
};
const SummaryCard = ({
  label,
  value,
  color = "blue",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  color?: string;
  icon: React.ElementType;
}) => {
  const { bg, text } = colorMap[color] || colorMap.blue;

  return (
    <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg flex flex-col items-center gap-2">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg ${bg}`}
      >
        <Icon className={`w-5 h-5 ${text}`} />
      </div>
      <div className={`text-2xl font-bold ${text}`}>{value}</div>
      <div className="text-sm text-slate-200">{label}</div>
    </div>
  );
};
