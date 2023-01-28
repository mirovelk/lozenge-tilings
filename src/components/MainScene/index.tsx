import {
  Edges,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
} from '@react-three/drei';
import { Canvas, ThreeElements } from '@react-three/fiber';
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

function Voxel({
  position,
  ...props
}: ThreeElements['mesh'] & { position: [number, number, number] }) {
  return (
    <mesh position={alignToGrid(position)} {...props}>
      <boxGeometry args={[voxelSize, voxelSize, voxelSize]} />
      <meshStandardMaterial color="#ff0000" opacity={0.8} transparent />
      <Edges />
    </mesh>
  );
}

function MainScene() {
  const positions = useAppSelector(selectVoxelPositions);

  return (
    <Canvas
      camera={{ fov: 45, near: 1, far: 10000, position: [600, 800, 1300] }}
    >
      <color attach="background" args={['#dfdfdf']} />
      <ambientLight color="#606060" />
      <directionalLight position={[1, 0.75, 0.5]} />
      <gridHelper args={[1000, 20]} />
      {positions.map((position, index) => (
        <Voxel position={position} key={index} />
      ))}
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
