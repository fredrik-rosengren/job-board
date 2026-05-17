'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Job, STAGES } from '@/lib/types'
import ScoreBar from './ScoreBar'

type Props = {
  jobs: Job[]
  onUpdate: (job: Job) => void
  onDelete: (id: number) => void
  onDetailOpen?: (job: Job) => void
}

const STAGE_COLORS: Record<string, string> = {
  new: 'bg-gray-100',
  relevant: 'bg-green-50',
  applied: 'bg-blue-50',
  interview: 'bg-yellow-50',
  rejected: 'bg-red-50',
}

export default function KanbanBoard({ jobs, onUpdate, onDelete, onDetailOpen }: Props) {
  async function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const jobId = parseInt(result.draggableId)
    const newStage = result.destination.droppableId as Job['stage']
    const job = jobs.find(j => j.id === jobId)
    if (!job || job.stage === newStage) return

    const res = await fetch(`/api/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    })
    onUpdate(await res.json())
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageJobs = jobs.filter(j => j.stage === stage.id)
          return (
            <div key={stage.id} className="flex-shrink-0 w-64">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="font-semibold text-sm text-gray-700">{stage.label}</h3>
                <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">{stageJobs.length}</span>
              </div>
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-24 rounded-lg p-2 space-y-2 transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50 ring-2 ring-indigo-300' : STAGE_COLORS[stage.id]}`}
                  >
                    {stageJobs.map((job, index) => (
                      <Draggable key={job.id} draggableId={String(job.id)} index={index}>
                        {(drag, dragSnapshot) => (
                          <div
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            {...drag.dragHandleProps}
                            onDoubleClick={() => onDetailOpen?.(job)}
                            className={`bg-white rounded-lg border p-3 shadow-sm space-y-1.5 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
                              dragSnapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-400' : job.relevant ? 'border-green-400' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div className="min-w-0">
                                <p className="font-medium text-xs leading-tight truncate">{job.title}</p>
                                <p className="text-xs text-gray-400 truncate">{job.company}</p>
                              </div>
                              <button
                                onClick={() => {
                                  fetch(`/api/jobs/${job.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ relevant: job.relevant ? 0 : 1 }),
                                  }).then(r => r.json()).then(onUpdate)
                                }}
                                className={`text-sm flex-shrink-0 ${job.relevant ? 'text-green-500' : 'text-gray-300'}`}
                              >★</button>
                            </div>
                            <ScoreBar score={job.score} />
                            {job.salary && <p className="text-xs text-gray-400">💰 {job.salary}</p>}
                            <div className="flex justify-between items-center pt-0.5">
                              {job.url
                                ? <a href={job.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline">Annons →</a>
                                : <span />}
                              <button
                                onClick={() => {
                                  if (confirm(`Ta bort "${job.title}"?`)) {
                                    fetch(`/api/jobs/${job.id}`, { method: 'DELETE' }).then(() => onDelete(job.id))
                                  }
                                }}
                                className="text-xs text-red-300 hover:text-red-500"
                              >✕</button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
