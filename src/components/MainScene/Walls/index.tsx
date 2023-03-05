import * as THREE from 'three';
import edgeBlue from './edgeBlue.png';
import { atom, useAtom } from 'jotai';
import VoxelInstances from '../VoxelInstances';
import { lozengeTilingComlink } from '../../../lozengeTilingComlink';
import { useCallback, useEffect } from 'react';
import { Vector3Tuple } from 'three';

const texture = new THREE.TextureLoader().load(edgeBlue);

export const wallsAtom = atom<Vector3Tuple[]>([]);

function Walls() {
  const [walls, setWalls] = useAtom(wallsAtom);

  const updateWalls = useCallback(async () => {
    setWalls(await lozengeTilingComlink.getWallVoxels());
  }, [setWalls]);

  useEffect(() => {
    updateWalls();
    // onlu on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>{walls.length > 0 && <VoxelInstances voxels={walls} map={texture} />}</>
  );
}

export default Walls;
