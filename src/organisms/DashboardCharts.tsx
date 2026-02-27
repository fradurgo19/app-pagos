import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { Card } from '../atoms/Card';
import { formatCurrency } from '../utils/formatters';
import type { ServiceTypeDataItem } from '../hooks/useDashboardData';

interface ServiceTypeTooltipPayload {
  name: string;
  value: number;
  consumption: number;
  unitOfMeasure: string;
  compareValue?: number;
  compareConsumption?: number;
}

const ServiceTypeTooltipContent: React.FC<{
  active?: boolean;
  payload?: Array<{ payload: unknown }>;
}> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as ServiceTypeTooltipPayload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-900 mb-2">{p.name}</p>
      <p className="text-gray-700">Valor: {formatCurrency(p.value)}</p>
      <p className="text-gray-700">
        Consumo: {Number(p.consumption).toLocaleString('es-CO')} {p.unitOfMeasure || '-'}
      </p>
      {p.compareValue !== undefined && (
        <>
          <p className="text-gray-600 mt-2 pt-2 border-t border-gray-100 text-xs font-medium">Comparativa</p>
          <p className="text-gray-600 text-xs">Valor: {formatCurrency(p.compareValue)}</p>
          {p.compareConsumption !== undefined && (
            <p className="text-gray-600 text-xs">
              Consumo: {Number(p.compareConsumption).toLocaleString('es-CO')} {p.unitOfMeasure || '-'}
            </p>
          )}
        </>
      )}
    </div>
  );
};

interface LocationTooltipPayload {
  fullName: string;
  value: number;
  count: number;
  unitsSummary: string;
  compareValue?: number;
}

const LocationTooltipContent: React.FC<{
  active?: boolean;
  payload?: Array<{ payload: unknown }>;
}> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as LocationTooltipPayload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm max-w-xs">
      <p className="font-semibold text-gray-900 mb-2 break-words">{p.fullName}</p>
      <p className="text-gray-700">Valor: {formatCurrency(p.value)}</p>
      <p className="text-gray-700">{p.count} factura(s)</p>
      <p className="text-gray-700">Total por unidad de medida: {p.unitsSummary || '-'}</p>
      {p.compareValue !== undefined && (
        <p className="text-gray-600 mt-2 pt-2 border-t border-gray-100 text-xs">
          Comparativa: {formatCurrency(p.compareValue)}
        </p>
      )}
    </div>
  );
};

function formatValueLabel(value: unknown): string {
  return formatCurrency(Number(value));
}

function formatConsumptionLabel(
  value: unknown,
  payload?: { unitOfMeasure?: string }
): string {
  const v = Number(value);
  const u = payload?.unitOfMeasure ?? '';
  if (v === 0 && !u) return '';
  return `${v.toLocaleString('es-CO')} ${u}`;
}

function formatUnitsSummaryLabel(_value: unknown, payload?: { unitsSummary?: string }): string {
  return payload?.unitsSummary ?? '-';
}

interface LabelListContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: unknown;
  payload?: { unitOfMeasure?: string } | { unit?: string } | { unitsSummary?: string };
}

function renderServiceTypeTooltip(props: { active?: boolean; payload?: Array<{ payload: unknown }> }) {
  return <ServiceTypeTooltipContent active={props.active} payload={props.payload} />;
}

function renderLocationTooltip(props: { active?: boolean; payload?: Array<{ payload: unknown }> }) {
  return <LocationTooltipContent active={props.active} payload={props.payload} />;
}

const ServiceTypeConsumptionLabelContent: React.FC<LabelListContentProps> = (props) => {
  const text = formatConsumptionLabel(props.value, props.payload as { unitOfMeasure?: string });
  if (!text) return null;
  const width = props.width ?? 0;
  if (width < 20) return null;
  return (
    <text
      x={(props.x ?? 0) + 6}
      y={(props.y ?? 0) + (props.height ?? 0) / 2}
      dy={4}
      fill="#fff"
      fontSize={10}
      fontWeight={600}
    >
      {text}
    </text>
  );
};

const LocationUnitsSummaryLabelContent: React.FC<LabelListContentProps> = (props) => {
  const text = formatUnitsSummaryLabel(props.value, props.payload as { unitsSummary?: string });
  if (!text || text === '-') return null;
  const width = props.width ?? 0;
  if (width < 30) return null;
  return (
    <text
      x={(props.x ?? 0) + (props.width ?? 0) / 2}
      y={(props.y ?? 0) + (props.height ?? 0) / 2}
      dy={4}
      fill="#fff"
      fontSize={9}
      fontWeight={600}
      textAnchor="middle"
    >
      {text.length > 28 ? `${text.slice(0, 25)}…` : text}
    </text>
  );
};

const CHART_COLORS = [
  '#cf1b22',
  '#a11217',
  '#50504f',
  '#d94c52',
  '#7f0c12',
  '#8b7355',
  '#9e2a2f',
  '#c41e3a'
];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <Card>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </Card>
);

interface TrendChartProps {
  labels: string[];
  data: number[];
  compareLabel?: string;
  compareData?: number[];
}

export const TrendChart: React.FC<TrendChartProps> = ({
  labels,
  data,
  compareLabel = 'Comparativa',
  compareData
}) => {
  const chartData = labels.map((label, index) => {
    const point: { name: string; amount: number; compareAmount?: number } = {
      name: label,
      amount: data[index] ?? 0
    };
    if (compareData?.[index] !== undefined) {
      point.compareAmount = compareData[index];
    }
    return point;
  });

  return (
    <ChartCard title="Tendencia de Gastos">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" tickFormatter={(v) => `$${Number(v).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`} />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Monto']}
            contentStyle={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="amount"
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            name="Periodo principal"
            dot={{ fill: CHART_COLORS[0] }}
          />
          {compareData && (
            <Line
              type="monotone"
              dataKey="compareAmount"
              stroke={CHART_COLORS[1]}
              strokeWidth={2}
              name={compareLabel}
              dot={{ fill: CHART_COLORS[1] }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

interface ServiceTypeChartProps {
  items: ServiceTypeDataItem[];
  title?: string;
  compareItems?: ServiceTypeDataItem[];
  compareLabel?: string;
}

export const ServiceTypeChart: React.FC<ServiceTypeChartProps> = ({
  items,
  title = 'Mes Actual por Tipo de Servicio',
  compareItems,
  compareLabel = 'Comparativa'
}) => {
  const chartData = items.map((item, index) => {
    const compareItem = compareItems?.[index];
    return {
      name: item.label,
      value: item.value,
      consumption: item.consumption,
      unitOfMeasure: item.unitOfMeasure,
      labelValue: item.value,
      labelConsumption: item.consumption,
      ...(compareItem && {
        compareValue: compareItem.value,
        compareConsumption: compareItem.consumption
      })
    };
  });

  const formatValue = (value: number) =>
    value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 8, bottom: 60 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            stroke="#6b7280"
            tickFormatter={(v) => `$${formatValue(Number(v))}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={200}
            interval={0}
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={renderServiceTypeTooltip} />
          <Legend />
          <Bar dataKey="value" name="Periodo principal" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} minPointSize={4}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              style={{ fontSize: 11, fill: '#374151' }}
              formatter={formatValueLabel as (value: React.ReactNode) => React.ReactNode}
            />
            <LabelList
              dataKey="consumption"
              position="insideLeft"
              content={<ServiceTypeConsumptionLabelContent />}
            />
          </Bar>
          {(compareItems?.length ?? 0) > 0 && (
            <Bar dataKey="compareValue" name={compareLabel} fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} minPointSize={4} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

interface LocationChartProps {
  labels: string[];
  data: number[];
  counts: number[];
  unitsSummary: string[];
  title?: string;
  compareData?: number[];
  compareLabel?: string;
}

export const LocationChart: React.FC<LocationChartProps> = ({
  labels,
  data,
  counts,
  unitsSummary,
  title = 'Distribución por Sede',
  compareData,
  compareLabel = 'Comparativa'
}) => {
  const chartData = labels.map((label, index) => ({
    name: label.length > 25 ? `${label.slice(0, 22)}...` : label,
    fullName: label,
    value: data[index],
    count: counts[index],
    unitsSummary: unitsSummary[index] ?? '-',
    ...(compareData?.[index] !== undefined && { compareValue: compareData[index] })
  }));

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            angle={-35}
            textAnchor="end"
            height={80}
            stroke="#6b7280"
            tick={{ fontSize: 11 }}
          />
          <YAxis
            stroke="#6b7280"
            tickFormatter={(v) => `$${Number(v).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`}
          />
          <Tooltip content={renderLocationTooltip} />
          <Legend />
          <Bar dataKey="value" name="Periodo principal" radius={[4, 4, 0, 0]} minPointSize={8}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${entry.fullName}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              style={{ fontSize: 10, fill: '#374151' }}
              formatter={formatValueLabel as (value: React.ReactNode) => React.ReactNode}
            />
            <LabelList
              dataKey="count"
              position="inside"
              content={<LocationUnitsSummaryLabelContent />}
            />
          </Bar>
          {(compareData?.length ?? 0) > 0 && (
            <Bar dataKey="compareValue" name={compareLabel} fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} minPointSize={8} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
