import React from 'react';
import { cn } from '@/lib/utils';

const Skeleton = ({ className }) => (
  <div className={cn('animate-pulse rounded-md bg-white/10', className)} />
);

export default Skeleton;
