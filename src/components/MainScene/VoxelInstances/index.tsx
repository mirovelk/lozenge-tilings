import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Vector3Tuple } from 'three';

const voxelSize = 50;

function alignToGrid(
  position: [number, number, number]
): [number, number, number] {
  return [
    voxelSize * position[0] + voxelSize / 2,
    voxelSize * position[1] + voxelSize / 2,
    voxelSize * position[2] + voxelSize / 2,
  ];
}

export default function VoxelInstances({
  voxels,
  map,
}: {
  voxels: Vector3Tuple[];
  map: THREE.Texture;
}) {
  const boxInstancedMeshRef: React.Ref<
    THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
  > | null = useRef(null);

  useEffect(() => {
    if (boxInstancedMeshRef.current) {
      const matrix = new THREE.Matrix4();
      // Set positions
      for (let i = 0; i < voxels.length; i++) {
        matrix.setPosition(...alignToGrid(voxels[i]));
        boxInstancedMeshRef?.current?.setMatrixAt(i, matrix);
      }
      // Update the instance
      boxInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [voxels]);

  return (
    <>
      <instancedMesh
        ref={boxInstancedMeshRef}
        args={[undefined, undefined, voxels.length]}
      >
        <boxGeometry args={[voxelSize, voxelSize, voxelSize]} />
        <meshStandardMaterial map={map} />
      </instancedMesh>
    </>
  );
}
