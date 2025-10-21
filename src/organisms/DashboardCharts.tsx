import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../atoms/Card';

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
}

export const TrendChart: React.FC<TrendChartProps> = ({ labels, data }) => {
  const chartData = labels.map((label, index) => ({
    name: label,
    amount: data[index]
  }));

  return (
    <ChartCard title="Tendencia de Gastos (6 Meses)">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Legend />
          <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Monto Total" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

interface ServiceTypeChartProps {
  labels: string[];
  data: number[];
  title?: string;
}

export const ServiceTypeChart: React.FC<ServiceTypeChartProps> = ({ labels, data, title = "Mes Actual por Tipo de Servicio" }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  
  const chartData = labels.map((label, index) => ({
    name: label,
    value: data[index]
  })).filter(item => item.value > 0);

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Legend />
          <Bar dataKey="value" name="Monto">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

interface LocationChartProps {
  labels: string[];
  data: number[];
  title?: string;
}

export const LocationChart: React.FC<LocationChartProps> = ({ labels, data, title = "Distribución por Centro de Costos" }) => {
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const chartData = labels.map((label, index) => ({
    name: label,
    value: data[index]
  })).filter(item => item.value > 0);

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
