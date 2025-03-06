import type { mapNamesUnion } from "@/libs/mapsParams";

type BearCaveLocation = {
  id: string;
  position: { x: number; y: number };
  name: string;
  description: string;
};

type BearCaveConfig = {
  [key in mapNamesUnion]?: BearCaveLocation[];
};

const bearCave: BearCaveConfig = {
  vikendi: [
    {
      id: "vikendi-bc-001",
      position: { x: 280, y: 134 },
      name: "熊洞",
      description: "",
    },
    {
      id: "vikendi-bc-002",
      position: { x: 517, y: 137.4 },
      name: "熊洞",
      description: "",
    },
    {
      id: "vikendi-bc-003",
      position: { x: 596, y: 171.4 },
      name: "熊洞",
      description: "",
    },
    {
      id: "vikendi-bc-004",
      position: { x: 561, y: 287.4 },
      name: "熊洞",
      description: "",
    },
    {
      id: "vikendi-bc-005",
      position: { x: 652.4, y: 381.4 },
      name: "熊洞",
      description: "",
    },
    {
      id: "vikendi-bc-006",
      position: { x: 462, y: 350.5 },
      name: "熊洞",
      description: "",
    },
    {
      id: "vikendi-bc-007",
      position: { x: 612, y: 578 },
      name: "熊洞",
      description: "",
    },
    {
      id: "vikendi-bc-008",
      position: { x: 515, y: 580 },
      name: "熊洞",
      description: "",
    },
    {
      id: "vikendi-bc-009",
      position: { x: 370, y: 639 },
      name: "熊洞",
      description: "",
    },
    {
      id: "vikendi-bc-010",
      position: { x: 374, y: 597 },
      name: "熊洞",
      description: "",
    },
  ],
};

export default bearCave;
