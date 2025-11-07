'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface PricePoint {
  time: string
  price: number
  volume: number
}

export default function TradingChart({ model }: { model: string }) {
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H')
  const [chartData, setChartData] = useState<PricePoint[]>([])
  const [currentPrice, setCurrentPrice] = useState(0.00120)
  const [priceChange, setPriceChange] = useState(2.4)

  // Generate initial chart data
  useEffect(() => {
    const generateData = () => {
      const points = timeframe === '1H' ? 60 : timeframe === '24H' ? 96 : 168
      const basePrice = 0.00120
      const data: PricePoint[] = []

      for (let i = 0; i < points; i++) {
        const time =
          timeframe === '1H'
            ? `${String(i).padStart(2, '0')}:00`
            : timeframe === '24H'
            ? `${Math.floor(i / 4)}:${(i % 4) * 15}`
            : `Day ${Math.floor(i / 24)}`

        const price = basePrice + (Math.random() - 0.5) * 0.0002
        const volume = Math.floor(Math.random() * 5000) + 1000

        data.push({ time, price, volume })
      }

      return data
    }

    setChartData(generateData())
  }, [timeframe, model])

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = [...prev]
        const lastPrice = newData[newData.length - 1].price
        const newPrice = lastPrice + (Math.random() - 0.5) * 0.00001

        newData.push({
          time: new Date().toLocaleTimeString(),
          price: newPrice,
          volume: Math.floor(Math.random() * 5000) + 1000,
        })

        return newData.slice(-100) // Keep last 100 points
      })

      setCurrentPrice((prev) => {
        const newPrice = prev + (Math.random() - 0.5) * 0.00001
        return newPrice
      })

      setPriceChange((prev) => prev + (Math.random() - 0.5) * 0.5)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatPrice = (value: number) => `$${value.toFixed(5)}`

  return (
    <motion.div
      className="glass rounded-xl border border-border overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Chart Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-text-secondary mb-1">
              {model} / USDC
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-black text-white">
                ${currentPrice.toFixed(5)}
              </div>
              <div
                className={`text-sm font-bold ${
                  priceChange >= 0 ? 'text-status-success' : 'text-status-error'
                }`}
              >
                {priceChange >= 0 ? '+' : ''}
                {priceChange.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {(['1H', '24H', '7D', '30D'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-accent-primary text-white'
                    : 'glass-hover text-text-secondary hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-text-secondary mb-1">High</div>
            <div className="text-sm font-bold text-status-success">
              ${(currentPrice * 1.05).toFixed(5)}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Low</div>
            <div className="text-sm font-bold text-status-error">
              ${(currentPrice * 0.95).toFixed(5)}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Avg</div>
            <div className="text-sm font-bold text-white">
              ${currentPrice.toFixed(5)}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Volume</div>
            <div className="text-sm font-bold text-accent-tertiary">
              2.1M
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9945FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9945FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
            <XAxis
              dataKey="time"
              stroke="#6B7280"
              tick={{ fontSize: 10 }}
              tickLine={false}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fontSize: 10 }}
              tickLine={false}
              tickFormatter={formatPrice}
              domain={['dataMin - 0.00005', 'dataMax + 0.00005']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#12121A',
                border: '1px solid #2A2A3A',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => [formatPrice(value), 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#9945FF"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="px-4 pb-4">
        <div className="text-xs text-text-secondary mb-2 font-semibold">
          VOLUME
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14F195" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14F195" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: '#12121A',
                border: '1px solid #2A2A3A',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Volume']}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#14F195"
              strokeWidth={1}
              fill="url(#volumeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
