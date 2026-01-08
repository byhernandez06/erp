import { useState } from "react";
import type { CuentaNode } from "@/utils/cuTree";
import { formatearColones } from "@/data/staticData";

interface Props {
    nodes: CuentaNode[];
    onSelect: (cuenta: string) => void;
}

export default function PartidasTree({ nodes, onSelect }: Props) {
    return (
        <div className="p-2 text-sm">
            {nodes.map((n) => (
                <TreeNode key={n.id} node={n} onSelect={onSelect} />
            ))}
        </div>
    );
}

function TreeNode({ node, onSelect }: { node: CuentaNode; onSelect: (id: string) => void }) {
    const [open, setOpen] = useState(false);

    const isLeaf = node.children.length === 0 && node.recibe === 1;

    return (
        <div className="ml-2">
            <div
                className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 p-1 rounded"
                onClick={() => (isLeaf ? onSelect(node.id) : setOpen(!open))}
            >
                {!isLeaf && (
                    <span className="text-xs text-gray-500">{open ? "▼" : "▶"}</span>
                )}
                <span className={isLeaf ? "font-medium text-green-700" : ""}>
                    {node.id}
                </span>
                <span className="text-gray-600">{node.label}</span>
                {node.disponible !== undefined && (
                    <span className="ml-auto text-xs text-emerald-600">
                        {formatearColones(node.disponible)}
                    </span>
                )}
            </div>

            {open && node.children.length > 0 && (
                <div className="pl-4 border-l border-gray-300">
                    {node.children.map((c) => (
                        <TreeNode key={c.id} node={c} onSelect={onSelect} />
                    ))}
                </div>
            )}
        </div>
    );
}
