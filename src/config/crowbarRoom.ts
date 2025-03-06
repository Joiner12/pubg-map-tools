import type { mapNamesUnion } from "@/libs/mapsParams";

type CrowbarRoomLocation = {
  id: string;
  position: { x: number; y: number };
  name: string;
  description: string;
};

type CrowbarRoomConfig = {
  [key in mapNamesUnion]?: CrowbarRoomLocation[];
};

const crowbarRoom: CrowbarRoomConfig = {
  vikendi: [
    {
      id: "vikendi-cr-001",
      position: { x: 139.4, y: 136 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-002",
      position: { x: 303, y: 124.4 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-003",
      position: { x: 357, y: 214 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-004",
      position: { x: 513.4, y: 258 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-005",
      position: { x: 317, y: 286 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-006",
      position: { x: 188.4, y: 301.4 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-007",
      position: { x: 445.4, y: 349 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-008",
      position: { x: 523.6, y: 359 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-009",
      position: { x: 672, y: 454 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-010",
      position: { x: 594.6, y: 484.4 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-011",
      position: { x: 649, y: 574 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-012",
      position: { x: 521.6, y: 608 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-013",
      position: { x: 424, y: 658.6 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-014",
      position: { x: 395.4, y: 541 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-015",
      position: { x: 354.6, y: 681 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-016",
      position: { x: 314, y: 590 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-017",
      position: { x: 288, y: 520 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-018",
      position: { x: 175.4, y: 438 },
      name: "撬棍房",
      description: "",
    },
    {
      id: "vikendi-cr-019",
      position: { x: 101, y: 483 },
      name: "撬棍房",
      description: "",
    },
  ],
};

export default crowbarRoom;
