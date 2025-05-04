export default function ScheduleCard({ sched }) {
  return (
    <div className="border p-3 mb-2 rounded bg-white shadow-sm">
      <div className="flex justify-between">
        <span>{sched.place}</span>
        <span className="text-sm text-gray-500">
          {sched.startAt ? sched.startAt.slice(11, 16) : '--:--'} - 
          {sched.endAt ? sched.endAt.slice(11, 16) : '--:--'}
        </span>
      </div>
      
      <div className="text-xs text-gray-400">
        {sched.status === 'done' ? '✅ 完了'
          : sched.status === 'near' ? '🟠 まもなく出発'
          : '⚪ 未設定'}
      </div>

      {sched.station && (
        <a
          href={`https://transit.yahoo.co.jp/search/result?from=&to=${encodeURIComponent(sched.station)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 underline mt-1 block"
        >
          🚃 {sched.station} までの乗換案内
        </a>
      )}
    </div>
  );
}
