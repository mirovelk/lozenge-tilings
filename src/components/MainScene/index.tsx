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
  ...props
}: ThreeElements['mesh'] & { positions: [number, number, number][] }) {
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
      <meshStandardMaterial color="#ff0000" opacity={0.8} transparent />
      {positions.length > 0 && <Edges geometry={geometry} />}
    </mesh>
  );
}

function MainScene() {
  const positions = useAppSelector(selectVoxelPositions);

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
      <MergedVoxels positions={positions} />
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
