interface MetricCardProps {
  title: string
  value: string | number
  format?: 'currency' | 'percentage' | 'number'
  change?: number
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
}

export default function MetricCard({
  title,
  value,
  format = 'number',
  change,
  icon,
  trend = 'neutral',
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    if (format === 'percentage') {
      return `${Number(val).toFixed(2)}%`;
    }
    return Number(val).toLocaleString('pt-BR');
  };

  const trendColor =
    trend === 'up'
      ? 'text-green-600'
      : trend === 'down'
        ? 'text-red-600'
        : 'text-gray-600';

  const trendIcon =
    trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{formatValue(value)}</p>
        </div>
        {icon && <span className="text-4xl">{icon}</span>}
      </div>

      {change !== undefined && (
        <div className={`mt-4 ${trendColor} text-sm font-medium`}>
          {trendIcon} {Math.abs(change).toFixed(2)}% from last month
        </div>
      )}
    </div>
  )
}
