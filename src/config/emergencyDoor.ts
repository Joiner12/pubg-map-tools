import type { mapNamesUnion } from "@/libs/mapsParams";

interface EmergencyDoor {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
}

type EmergencyDoorConfig = {
  [key in mapNamesUnion]?: EmergencyDoor[];
};

const emergencyDoor: EmergencyDoorConfig = {
  deston: [
    {
      id: "emergency-door-001",
      name: "安全门 #1",
      position: { x: 271, y: 52.4 },
    },
    {
      id: "emergency-door-002",
      name: "安全门 #2",
      position: { x: 510, y: 88.6 },
    },
    {
      id: "emergency-door-003",
      name: "安全门 #3",
      position: { x: 657, y: 184 },
    },
    {
      id: "emergency-door-004",
      name: "安全门 #4",
      position: { x: 498.6, y: 192.6 },
    },
    {
      id: "emergency-door-005",
      name: "安全门 #5",
      position: { x: 191.6, y: 177.8 },
    },
    {
      id: "emergency-door-006",
      name: "安全门 #6",
      position: { x: 188.4, y: 145 },
    },
    {
      id: "emergency-door-007",
      name: "安全门 #7",
      position: { x: 183.2, y: 141 },
    },
    {
      id: "emergency-door-008",
      name: "安全门 #8",
      position: { x: 308, y: 265 },
    },
    {
      id: "emergency-door-009",
      name: "安全门 #9",
      position: { x: 445, y: 268 },
    },
    {
      id: "emergency-door-010",
      name: "安全门 #10",
      position: { x: 721, y: 310 },
    },
    {
      id: "emergency-door-011",
      name: "安全门 #11",
      position: { x: 322, y: 353 },
    },
    {
      id: "emergency-door-012",
      name: "安全门 #12",
      position: { x: 171, y: 332.6 },
    },
    {
      id: "emergency-door-013",
      name: "安全门 #13",
      position: { x: 161, y: 447 },
    },
    {
      id: "emergency-door-014",
      name: "安全门 #14",
      position: { x: 225.4, y: 462.4 },
    },
    {
      id: "emergency-door-015",
      name: "安全门 #15",
      position: { x: 374.6, y: 446.6 },
    },
    {
      id: "emergency-door-016",
      name: "安全门 #16",
      position: { x: 449, y: 401 },
    },
    {
      id: "emergency-door-017",
      name: "安全门 #17",
      position: { x: 559, y: 630 },
    },
    {
      id: "emergency-door-018",
      name: "安全门 #18",
      position: { x: 370, y: 558 },
    },
    {
      id: "emergency-door-019",
      name: "安全门 #19",
      position: { x: 112, y: 619 },
    },
    {
      id: "emergency-door-020",
      name: "安全门 #20",
      position: { x: 582.6, y: 466.4 },
    },
    {
      id: "emergency-door-021",
      name: "安全门 #21",
      position: { x: 591.6, y: 460 },
    },
    {
      id: "emergency-door-022",
      name: "安全门 #22",
      position: { x: 601.4, y: 462.4 },
    },
    {
      id: "emergency-door-023",
      name: "安全门 #23",
      position: { x: 626, y: 452 },
    },
    {
      id: "emergency-door-024",
      name: "安全门 #24",
      position: { x: 640.4, y: 457.6 },
    },
    {
      id: "emergency-door-025",
      name: "安全门 #25",
      position: { x: 641.8, y: 455.6 },
    },
    {
      id: "emergency-door-026",
      name: "安全门 #26",
      position: { x: 646, y: 449 },
    },
    {
      id: "emergency-door-027",
      name: "安全门 #27",
      position: { x: 658.4, y: 451.1 },
    },
    {
      id: "emergency-door-028",
      name: "安全门 #28",
      position: { x: 664, y: 445 },
    },
    {
      id: "emergency-door-029",
      name: "安全门 #29",
      position: { x: 639, y: 425.8 },
    },
    {
      id: "emergency-door-030",
      name: "安全门 #30",
      position: { x: 644.5, y: 407 },
    },
    {
      id: "emergency-door-031",
      name: "安全门 #31",
      position: { x: 635, y: 399.4 },
    },
    {
      id: "emergency-door-032",
      name: "安全门 #32",
      position: { x: 617, y: 405 },
    },
    {
      id: "emergency-door-033",
      name: "安全门 #33",
      position: { x: 606.6, y: 410 },
    },
    {
      id: "emergency-door-034",
      name: "安全门 #34",
      position: { x: 605.4, y: 415.6 },
    },
    {
      id: "emergency-door-035",
      name: "安全门 #35",
      position: { x: 599.4, y: 414.6 },
    },
  ],
};

export default emergencyDoor;
