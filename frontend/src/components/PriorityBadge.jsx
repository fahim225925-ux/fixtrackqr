import React from 'react';

export default function PriorityBadge({ priority }) {
  const p = priority || 'Medium';
  const className = `badge badge-priority-${p.toLowerCase()}`;
  return <span className={className}>{p}</span>;
}
