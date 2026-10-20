import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { LogStatusIcon } from "@/components/ui/status-badge";
import { formatNumber, formatTime } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n";
import type { RequestLog } from "@/lib/dummy/types";

/**
 * Static table: rows follow the order provided by the data layer. Column
 * headers are plain text — no sorting affordance, by design.
 */
export function RequestTable({ logs, dict }: { logs: RequestLog[]; dict: Dictionary }) {
  return (
    <Card>
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-text">{dict.monitoring.tableTitle}</h2>
        <p className="mt-0.5 text-sm text-text-muted">{dict.monitoring.tableSubtitle}</p>
      </div>

      <Table caption={dict.monitoring.tableTitle}>
        <THead>
          <TH>{dict.monitoring.columns.time}</TH>
          <TH>{dict.monitoring.columns.model}</TH>
          <TH align="right">{dict.monitoring.columns.tokensIn}</TH>
          <TH align="right">{dict.monitoring.columns.tokensOut}</TH>
          <TH align="right">{dict.monitoring.columns.duration}</TH>
          <TH align="right">{dict.monitoring.columns.status}</TH>
        </THead>
        <TBody>
          {logs.map((log) => (
            <TR key={log.id}>
              <TD
                numeric
                className="text-text-muted"
              >
                {formatTime(log.timestamp)}
              </TD>
              <TD className="text-text text-nowrap">{log.modelName}</TD>
              <TD
                numeric
                align="right"
              >
                {formatNumber(log.tokensIn)}
              </TD>
              <TD
                numeric
                align="right"
              >
                {formatNumber(log.tokensOut)}
              </TD>
              <TD
                numeric
                align="right"
              >
                {formatNumber(log.latencyMs)} ms
              </TD>
              <TD align="right">
                <LogStatusIcon
                  status={log.status}
                  dict={dict}
                />
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  );
}
