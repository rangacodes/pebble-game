import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface Node {
  hasPebble: boolean;
  level: number;
}

interface Nodes {
  [key: number]: Node;
}

const BinaryTreePebbleGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [pebblesUsed, setPebblesUsed] = useState(0);
  const [maxPebblesUsed, setMaxPebblesUsed] = useState(0);
  // const [draggedPebble, setDraggedPebble] = useState<number | null>(null);
  const [treeDepth, setTreeDepth] = useState(3); // Default depth is 3
  const confettiShown = useRef(false);

  const totalNodes = Math.pow(2, treeDepth) - 1;

  const [nodes, setNodes] = useState<Nodes>(() => {
    const initialNodes: Nodes = {};
    for (let i = 0; i < totalNodes; i++) {
      initialNodes[i] = { hasPebble: false, level: Math.floor(Math.log2(i + 1)) };
    }
    return initialNodes;
  });

  const getNodePosition = (nodeId: number) => {
    const level = Math.floor(Math.log2(nodeId + 1));
    const positionInLevel = nodeId - (Math.pow(2, level) - 1);
    const totalNodesInLevel = Math.pow(2, level);
    
    const x = 50 + (positionInLevel * (800 / totalNodesInLevel)) + (400 / totalNodesInLevel);
    const y = 80 + level * 120;
    
    return { x, y };
  };

  const getParent = (nodeId: number): number | null => {
    if (nodeId === 0) return null;
    return Math.floor((nodeId - 1) / 2);
  };

  const getChildren = (nodeId: number): number[] => {
    const left = 2 * nodeId + 1;
    const right = 2 * nodeId + 2;
    return left < totalNodes ? [left, right < totalNodes ? right : null].filter((x): x is number => x !== null) : [];
  };

  const getSibling = (nodeId: number): number | null => {
    if (nodeId === 0) return null;
    const parent = getParent(nodeId);
    if (parent === null) return null;
    const children = getChildren(parent);
    return children.find(child => child !== nodeId) ?? null;
  };

  const isBottomLayer = (nodeId: number) => {
    const bottomLayerStart = Math.pow(2, treeDepth - 1) - 1;
    return nodeId >= bottomLayerStart; // Nodes in the bottom layer
  };

  const startGame = () => {
    setGameStarted(true);
    setGameWon(false);
    setPebblesUsed(0);
    setMaxPebblesUsed(0);
    const resetNodes: Nodes = {};
    for (let i = 0; i < totalNodes; i++) {
      resetNodes[i] = { hasPebble: false, level: Math.floor(Math.log2(i + 1)) };
    }
    setNodes(resetNodes);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameWon(false);
    setPebblesUsed(0);
    setMaxPebblesUsed(0);
    confettiShown.current = false;
    const resetNodes: Nodes = {};
    for (let i = 0; i < totalNodes; i++) {
      resetNodes[i] = { hasPebble: false, level: Math.floor(Math.log2(i + 1)) };
    }
    setNodes(resetNodes);
  };

  const handleDepthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDepth = parseInt(e.target.value, 10);
    setTreeDepth(newDepth);
    resetGame();
  };

  const handleNodeClick = (nodeId: number) => {
    if (!gameStarted || gameWon) return;

    const newNodes = { ...nodes };
    
    if (nodes[nodeId].hasPebble) {
      // Check if this node has a sibling with a pebble
      const sibling = getSibling(nodeId);
      const parent = getParent(nodeId);
      
      if (sibling !== null && nodes[sibling].hasPebble && parent !== null) {
        // Move pebble to parent if both siblings have pebbles
        newNodes[nodeId].hasPebble = false;
        newNodes[parent].hasPebble = true;
        
        // Check win condition
        if (parent === 0) {
          setGameWon(true);
        }
      } else {
        // Remove pebble if sibling doesn't have a pebble
        newNodes[nodeId].hasPebble = false;
        
        // Update current pebbles count
        const newPebblesUsed = Object.values(newNodes).filter(node => node.hasPebble).length;
        setPebblesUsed(newPebblesUsed);
      }
    } else if (isBottomLayer(nodeId)) {
      // Add pebble to bottom layer
      newNodes[nodeId].hasPebble = true;
      
      // Update current pebbles count and max
      const newPebblesUsed = Object.values(newNodes).filter(node => node.hasPebble).length;
      setPebblesUsed(newPebblesUsed);
      if (newPebblesUsed > maxPebblesUsed) {
        setMaxPebblesUsed(newPebblesUsed);
      }
    }
    
    setNodes(newNodes);
  };

  // const handleDragStart = (e: React.DragEvent, nodeId: number) => {
  //   if (!nodes[nodeId].hasPebble) return;
  //   setDraggedPebble(nodeId);
  //   e.dataTransfer.effectAllowed = 'move';
  //   e.dataTransfer.setData('text/plain', nodeId.toString());
  // };

  // const handleDragOver = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.dataTransfer.dropEffect = 'move';
  // };

  // const handleDrop = (e: React.DragEvent, targetNodeId: number) => {
  //   e.preventDefault();
    
  //   if (draggedPebble === null || !nodes[draggedPebble].hasPebble) {
  //     setDraggedPebble(null);
  //     return;
  //   }
    
  //   const parent = getParent(draggedPebble);
  //   const sibling = getSibling(draggedPebble);
    
  //   // Can only move up to parent if both siblings have pebbles
  //   if (parent === targetNodeId && sibling !== null && nodes[sibling].hasPebble) {
  //     const newNodes = { ...nodes };
  //     newNodes[draggedPebble].hasPebble = false;
  //     newNodes[targetNodeId].hasPebble = true;
  //     setNodes(newNodes);
      
  //     // Check win condition
  //     if (targetNodeId === 0) {
  //       setGameWon(true);
  //     }
  //   }
    
  //   setDraggedPebble(null);
  // };

  const renderPebbleCounter = () => {
    return (
      <div className="flex flex-col items-center space-y-2 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold text-lg">Pebble Counter</h3>
        <div className="text-center">
          <p className="text-sm text-gray-600">Currently using: <span className="font-bold text-blue-600">{pebblesUsed}</span></p>
          <p className="text-sm text-gray-600">Max used so far: <span className="font-bold text-red-600">{maxPebblesUsed}</span></p>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (gameWon && maxPebblesUsed === treeDepth && !confettiShown.current) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      confettiShown.current = true;
    }
  }, [gameWon, maxPebblesUsed, treeDepth]);

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Binary Tree Pebble Game
          </h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Select Tree Depth:</h2>
              <select
                value={treeDepth}
                onChange={handleDepthChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                {[2, 3, 4, 5].map(depth => (
                  <option key={depth} value={depth}>
                    Depth {depth}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Rules:</h2>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click on the bottom layer nodes to place pebbles on them</li>
                <li>• Click on a pebble to move it up (if both siblings have pebbles on them) or remove it (otherwise)</li>
                <li>• Goal: Get a pebble to the top with using as few pebbles as possible!</li>
              </ul>
            </div>
            <button
              onClick={startGame}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Binary Tree Pebble Game</h1>
        <div className="flex items-center space-x-4">
          {renderPebbleCounter()}
          <button
            onClick={resetGame}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
      
      {gameWon && (
        <div className="text-center mb-4 p-4 bg-green-100 border border-green-400 rounded-lg">
          <h2 className="text-2xl font-bold text-green-800">🎉 Congratulations! You Won! 🎉</h2>
          <p className="text-green-600">You successfully moved a pebble to the root!</p>
          <p className="text-lg font-semibold text-green-700 mt-2">
            Maximum pebbles used: <span className="text-2xl">{maxPebblesUsed}</span>
          </p>
          {maxPebblesUsed === treeDepth ? (
            <p className="text-lg font-semibold text-green-700 mt-2">
              Perfect! You used the optimum number of pebbles!
            </p>
          ) : (
            <p className="text-lg font-semibold text-grey-800">
              <b>Great work, but can you do it with fewer pebbles?</b>
            </p>
          )}
        </div>
      )}
      
      <div className="relative w-full h-[500px] bg-white rounded-lg shadow-lg overflow-hidden">
        <svg width="100%" height="100%" viewBox={`0 0 900 ${treeDepth * 120}`} style={{ userSelect: 'none' }}>
          {/* Draw edges */}
          {Array.from({ length: totalNodes }, (_, i) => {
            const children = getChildren(i);
            const parentPos = getNodePosition(i);
            
            return children.map(childId => {
              const childPos = getNodePosition(childId);
              return (
                <line
                  key={`edge-${i}-${childId}`}
                  x1={parentPos.x}
                  y1={parentPos.y}
                  x2={childPos.x}
                  y2={childPos.y}
                  stroke="#374151"
                  strokeWidth="2"
                />
              );
            });
          })}
          
          {/* Draw nodes */}
          {Array.from({ length: totalNodes }, (_, i) => {
            const pos = getNodePosition(i);
            const isClickable = isBottomLayer(i) && !nodes[i].hasPebble;
            const canRemove = nodes[i].hasPebble;
            
            return (
              <g key={i}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="20"
                  fill={nodes[i].hasPebble ? "#FDE047" : "#F3F4F6"}
                  stroke={nodes[i].hasPebble ? "#CA8A04" : "#9CA3AF"}
                  strokeWidth="2"
                  className={`${(isClickable || canRemove) ? 'cursor-pointer hover:stroke-blue-500' : ''}`}
                  onClick={() => handleNodeClick(i)}
                  style={{ userSelect: 'none' }}
                />
                {nodes[i].hasPebble && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="15"
                    fill="#FBBF24"
                    stroke="#D97706"
                    strokeWidth="2"
                    className="cursor-pointer"
                    style={{ userSelect: 'none' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeClick(i);
                    }}
                  />
                )}
                <text
                  x={pos.x}
                  y={pos.y + 35}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-600"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {i}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 bg-white p-4 rounded-lg">
        <p><strong>How to play:</strong></p>
        <p>• Click on the bottom layer nodes to place pebbles on them.</p>
        <p>• Click on a pebble to move it up (if both siblings have pebbles on them) or remove it (otherwise)</p>
        <p>• Goal: Get a pebble to the top (node 0) using as few pebbles as possible!</p>
      </div>
    </div>
  );
};

export default BinaryTreePebbleGame;
