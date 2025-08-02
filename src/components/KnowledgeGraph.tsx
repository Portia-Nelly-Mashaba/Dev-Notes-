import React, { useEffect, useRef, useState } from 'react';
import { ReactFlow, Node, Edge, Controls, Background, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Note } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, GitBranch, Zap } from 'lucide-react';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';

interface KnowledgeGraphProps {
  notes: Note[];
  onNodeClick?: (noteId: string) => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ notes, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateDependencyMap } = useAdvancedAI();

  const generateGraph = async () => {
    if (!notes.length) return;

    setIsGenerating(true);
    try {
      const dependencyMap = await generateDependencyMap(notes);
      
      // Convert AI response to React Flow format
      const graphNodes: Node[] = dependencyMap.nodes.map((node, index) => ({
        id: node.id,
        type: 'default',
        position: {
          x: Math.cos(index * 2 * Math.PI / dependencyMap.nodes.length) * 300 + 400,
          y: Math.sin(index * 2 * Math.PI / dependencyMap.nodes.length) * 300 + 300
        },
        data: {
          label: node.label
        },
        style: {
          backgroundColor: getNodeColor(node.type),
          borderRadius: '8px',
          fontSize: '12px',
          border: '2px solid',
          borderColor: getNodeBorderColor(node.type),
          width: Math.max(100, node.size * 20),
          height: 60
        }
      }));

      const graphEdges: Edge[] = dependencyMap.edges.map((edge, index) => ({
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        style: {
          strokeWidth: Math.max(1, edge.strength * 3),
          stroke: edge.strength > 0.7 ? '#10b981' : edge.strength > 0.4 ? '#f59e0b' : '#6b7280'
        },
        markerEnd: {
          type: 'arrowclosed' as any,
          width: 20,
          height: 20
        }
      }));

      setNodes(graphNodes);
      setEdges(graphEdges);
    } catch (error) {
      console.error('Failed to generate knowledge graph:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getNodeColor = (type: string): string => {
    switch (type) {
      case 'framework': return '#3b82f6';
      case 'concept': return '#8b5cf6';
      case 'note': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getNodeBorderColor = (type: string): string => {
    switch (type) {
      case 'framework': return '#1d4ed8';
      case 'concept': return '#7c3aed';
      case 'note': return '#059669';
      default: return '#374151';
    }
  };

  const onNodeClickHandler = (event: React.MouseEvent, node: Node) => {
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  };

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Knowledge Graph
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={generateGraph} 
            disabled={isGenerating || !notes.length}
            size="sm"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Generate Graph
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[500px]">
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClickHandler}
            fitView
            attributionPosition="top-right"
          >
            <Controls />
            <Background gap={12} size={1} />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Generate a knowledge graph to visualize connections between your notes</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};