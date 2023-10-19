import React from 'react';
import { useAppState } from '../state/store';
import './TaskLog.css'

export default function TaskLog() {
  const log :string = useAppState((state) => state.currentTask.log);

  return (
    <section>
      <h2>Action history</h2>
      <pre>{log}</pre>
    </section>
  );
}
