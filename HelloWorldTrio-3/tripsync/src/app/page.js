"use client";

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ensureAnon } from '@/lib/firebase';
import { fetchSchedules } from '@/lib/schedules';
import ScheduleCard from '@/app/_components/ScheduleCard';

export default function Home() {
  useEffect(() => { ensureAnon(); }, []);

  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules'],
    queryFn: fetchSchedules,
  });

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">TripSync 🚀</h1>

      {schedules.map(schedule => (
        <ScheduleCard
          key={schedule.id}
          sched={{
            id: schedule.id,
            place: schedule.place,
            startAt: schedule.startAt,
            endAt: schedule.endAt,
            status: schedule.status,
            station: schedule.station, // ← ここが必要
          }}
        />
      ))}

      <a
        href="/add"
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg text-lg"
      >
        ＋
      </a>
    </main>
  );
}
