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

const helpersSize = 10000;
const rotation = new THREE.Euler(Math.PI / 2, 0, 0);

function MainScene() {
  const positions = useAppSelector(selectVoxelPositions);

  return (
    <Canvas
      camera={{
        position: [helpersSize, helpersSize, helpersSize],
        near: 0.1,
        far: helpersSize * 4,
        up: [0, 0, 1],
      }}
      orthographic
    >
      <color attach="background" args={['#dfdfdf']} />
      <ambientLight color="#777777" />
      <directionalLight position={[1, 0.75, 0.5]} />
      <gridHelper
        args={[helpersSize, helpersSize / voxelSize]}
        rotation={rotation}
      />
      <MergedVoxels positions={positions} color="#ff0000" />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport
          axisColors={['#9d4b4b', '#3b5b9d', '#2f7f4f']}
          labelColor="white"
        />
      </GizmoHelper>
      <OrbitControls makeDefault />
    </Canvas>
  );
}

export default MainScene;
