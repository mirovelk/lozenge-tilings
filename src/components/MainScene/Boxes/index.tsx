import * as THREE from 'three';
import edgeRed from './edgeRed.png';
import { atom, useAtom } from 'jotai';
import VoxelInstances from '../VoxelInstances';
import { boxCountsAtom } from '../BoxCounters';
import { lozengeTilingComlink } from '../../../lozengeTilingComlink';

const texture = new THREE.TextureLoader().load(edgeRed);

export const boxesAtom = atom([], async (_, set, boxes) => {
  set(boxesAtom, boxes);
  const boxCounts = await lozengeTilingComlink.getPeriodBoxCount();
  if (boxCounts === 0) {
    set(boxCountsAtom, []);
  } else {
    set(boxCountsAtom, (prevBoxCounts) => [...prevBoxCounts, boxCounts]);
  }
});

function Boxes() {
  const [boxes] = useAtom(boxesAtom);

  return (
    <>{boxes.length > 0 && <VoxelInstances voxels={boxes} map={texture} />}</>
  );
}

export default Boxes;
