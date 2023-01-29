import {
  Edges,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
} from '@react-three/drei';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { selectPeriods } from '../../redux/features/config/configSlice';
import { selectVoxelPositions } from '../../redux/features/generate/generateSlice';
import { useAppSelector } from '../../redux/store';

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

function MergedVoxels({
  positions,
  color,
  ...props
}: ThreeElements['mesh'] & {
  positions: [number, number, number][];
  color: string;
}) {
  const geometry = useMemo(() => {
    if (positions.length === 0) {
      return new THREE.BufferGeometry();
    }
    const boxes = positions.map((position) => {
      const box = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
      box.translate(...alignToGrid(position));
      return box;
    });
    const base = mergeBufferGeometries(boxes);
    return base;
  }, [positions]);

  return (
    <mesh {...props} geometry={geometry}>
      <meshStandardMaterial color={color} opacity={0.8} transparent />
      {positions.length > 0 && <Edges geometry={geometry} />}
    </mesh>
  );
}

function MainScene() {
  const positions = useAppSelector(selectVoxelPositions);
  const { pX, pY, pZ } = useAppSelector(selectPeriods);

  return (
    <Canvas
      camera={{
        fov: 45,
        near: 1,
        far: 100000,
        position: [3000, 1500, 3000],
      }}
    >
      <color attach="background" args={['#dfdfdf']} />
      <ambientLight color="#606060" />
      <directionalLight position={[1, 0.75, 0.5]} />
      <gridHelper args={[1000, 20]} />
      <MergedVoxels positions={positions} color="#ff0000" />
      {/* {pX > 0 && (
        <>
          <MergedVoxels
            positions={positions}
            color="#00ff00"
            position={[pX * voxelSize, 0, 0]}
          />
        </>
      )}
      {pZ > 0 && (
        <>
          <MergedVoxels
            positions={positions}
            color="#ff8400"
            position={[0, 0, pZ * voxelSize]}
          />
        </>
      )} */}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport
          axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']}
          labelColor="white"
        />
      </GizmoHelper>
      <OrbitControls makeDefault dampingFactor={0.3} />
    </Canvas>
  );
}

export default MainScene;
