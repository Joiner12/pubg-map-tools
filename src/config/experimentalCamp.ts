import type { mapNamesUnion } from "@/libs/mapsParams";

type ExperimentalCampLocation = {
  id: string;
  position: { x: number; y: number };
  name: string;
  description: string;
};

type ExperimentalCampConfig = {
  [key in mapNamesUnion]?: ExperimentalCampLocation[];
};

const experimentalCamp: ExperimentalCampConfig = {
  vikendi: [
    {
      id: "vikendi-ec-001",
      position: { x: 322, y: 104 },
      name: "实验营地",
      description: "",
    },
    {
      id: "vikendi-ec-002",
      position: { x: 316, y: 190 },
      name: "实验营地",
      description: "",
    },
    {
      id: "vikendi-ec-003",
      position: { x: 223, y: 214 },
      name: "实验营地",
      description: "",
    },
    {
      id: "vikendi-ec-004",
      position: { x: 198, y: 263.4 },
      name: "实验营地",
      description: "",
    },
  ],
};

export default experimentalCamp;
