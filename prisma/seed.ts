import {
  PrismaClient,
  Prisma,
  ProjectStatus,
  TaskStatus,
  Priority,
  ApprovalStatus,
  DocumentVisibility,
  ObservationStatus,
} from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

const prisma = new PrismaClient();
const d = (value: string) => new Date(`${value}T08:00:00.000Z`);
const money = (value: number) => new Prisma.Decimal(value);

function passwordHash(password: string) {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("hex")}$${scryptSync(password, salt, 64).toString("hex")}`;
}

type ScheduleItem = {
  title: string;
  start: string;
  end: string;
  progress: number;
  phase: string;
  lot?: string;
  milestone?: boolean;
  dependencies?: number[];
};

type ProjectSeed = {
  reference: string;
  name: string;
  address: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  worksBudget: number;
  feesBudget: number;
  startDate: string;
  endDate: string;
  client: number;
  phaseProgress: Record<string, number>;
  schedule: ScheduleItem[];
};

const phaseTemplates = [
  ["ESQ", "Esquisse"],
  ["APS", "Avant-projet sommaire"],
  ["APD", "Avant-projet définitif"],
  ["PRO", "Études de projet"],
  ["DCE", "Dossier de consultation des entreprises"],
  ["ACT", "Assistance aux contrats de travaux"],
  ["VISA", "Visa des études d’exécution"],
  ["DET", "Direction de l’exécution des travaux"],
  ["OPC", "Ordonnancement, pilotage et coordination"],
  ["AOR", "Assistance aux opérations de réception"],
] as const;

const companySeeds = [
  ["Armor Terrassement", "Terrassement / VRD"],
  ["Fondations Bretagne", "Fondations"],
  ["Bretagne Maçonnerie", "Gros œuvre / Maçonnerie"],
  ["Structures Bois Ouest", "Charpente"],
  ["Couverture Atlantique", "Couverture / Étanchéité"],
  ["Menuiseries de l’Ouest", "Menuiseries extérieures"],
  ["Isol’Ouest", "Isolation / Plâtrerie"],
  ["Élec Bretagne", "Électricité"],
  ["Plomberie Rennaise", "Plomberie"],
  ["Thermique Services", "CVC / Chauffage"],
  ["Sols & Matières", "Revêtements de sols"],
  ["Agencement Armor", "Menuiseries intérieures"],
  ["Peinture Armor", "Peinture"],
  ["Façades de Bretagne", "Façades"],
  ["Paysages de Bretagne", "Aménagements extérieurs"],
  ["Déconstruction Ouest", "Curage / Désamiantage"],
  ["Sécurité Incendie Ouest", "Sécurité incendie"],
  ["Cloisons Concept", "Cloisons / Faux plafonds"],
];

const lotTemplates = [
  ["01", "Installation de chantier", "Terrassement / VRD"],
  ["02", "Terrassement", "Terrassement / VRD"],
  ["03", "Fondations", "Fondations"],
  ["04", "VRD et assainissement", "Terrassement / VRD"],
  ["05", "Gros œuvre / Maçonnerie", "Gros œuvre / Maçonnerie"],
  ["06", "Charpente", "Charpente"],
  ["07", "Couverture / Étanchéité", "Couverture / Étanchéité"],
  ["08", "Menuiseries extérieures", "Menuiseries extérieures"],
  ["09", "Isolation / Plâtrerie", "Isolation / Plâtrerie"],
  ["10", "Électricité CFO/CFA", "Électricité"],
  ["11", "Plomberie / Sanitaires", "Plomberie"],
  ["12", "Chauffage / CVC", "CVC / Chauffage"],
  ["13", "Chapes et revêtements de sols", "Revêtements de sols"],
  ["14", "Menuiseries intérieures", "Menuiseries intérieures"],
  ["15", "Peinture", "Peinture"],
  ["16", "Façades", "Façades"],
  ["17", "Aménagements extérieurs", "Aménagements extérieurs"],
  ["18", "OPR et réception", "Sécurité incendie"],
] as const;

const clients = [
  [
    "Famille Le Gall",
    "contact.legall@example.test",
    "12 rue des Tilleuls, 35000 Rennes",
  ],
  [
    "SCI Ker Anna",
    "contact@ker-anna.example.test",
    "8 rue de la Cité, 35400 Saint-Malo",
  ],
  [
    "Ville de Bruz",
    "batiments@bruz.example.test",
    "Place du Docteur Joly, 35170 Bruz",
  ],
  [
    "Novaxis Conseil",
    "immobilier@novaxis.example.test",
    "2 avenue des Champs Blancs, 35510 Cesson-Sévigné",
  ],
  [
    "Ouest Industrie",
    "travaux@ouest-industrie.example.test",
    "Parc industriel de la Haie, 35320 Crevin",
  ],
] as const;

const projects: ProjectSeed[] = [
  {
    reference: "BAT-2026-001",
    name: "Maison contemporaine Rennes",
    address: "24 rue de la Prévalaye, 35000 Rennes",
    description:
      "Construction neuve d’une maison individuelle de 185 m² avec garage, pompe à chaleur et aménagements paysagers.",
    status: ProjectStatus.CONSTRUCTION,
    progress: 42,
    worksBudget: 485000,
    feesBudget: 58200,
    startDate: "2026-02-02",
    endDate: "2026-12-18",
    client: 0,
    phaseProgress: {
      ESQ: 100,
      APS: 100,
      APD: 100,
      PRO: 100,
      DCE: 100,
      ACT: 100,
      VISA: 70,
      DET: 42,
      OPC: 45,
      AOR: 0,
    },
    schedule: [
      {
        title: "Permis de construire obtenu",
        start: "2026-02-02",
        end: "2026-02-02",
        progress: 100,
        phase: "APD",
        milestone: true,
      },
      {
        title: "Installation de chantier",
        start: "2026-03-02",
        end: "2026-03-06",
        progress: 100,
        phase: "DET",
        lot: "01",
      },
      {
        title: "Terrassement",
        start: "2026-03-09",
        end: "2026-03-20",
        progress: 100,
        phase: "DET",
        lot: "02",
        dependencies: [1],
      },
      {
        title: "Fondations",
        start: "2026-03-23",
        end: "2026-04-10",
        progress: 100,
        phase: "DET",
        lot: "03",
        dependencies: [2],
      },
      {
        title: "VRD et assainissement",
        start: "2026-04-06",
        end: "2026-04-17",
        progress: 100,
        phase: "DET",
        lot: "04",
      },
      {
        title: "Élévation maçonnerie",
        start: "2026-04-13",
        end: "2026-05-29",
        progress: 100,
        phase: "DET",
        lot: "05",
        dependencies: [3],
      },
      {
        title: "Charpente",
        start: "2026-06-01",
        end: "2026-06-19",
        progress: 100,
        phase: "DET",
        lot: "06",
      },
      {
        title: "Couverture et étanchéité",
        start: "2026-06-15",
        end: "2026-07-03",
        progress: 100,
        phase: "DET",
        lot: "07",
      },
      {
        title: "Hors d’eau",
        start: "2026-07-03",
        end: "2026-07-03",
        progress: 100,
        phase: "OPC",
        milestone: true,
      },
      {
        title: "Menuiseries extérieures",
        start: "2026-06-29",
        end: "2026-07-10",
        progress: 100,
        phase: "DET",
        lot: "08",
      },
      {
        title: "Hors d’air",
        start: "2026-07-10",
        end: "2026-07-10",
        progress: 100,
        phase: "OPC",
        milestone: true,
      },
      {
        title: "Isolation et plâtrerie",
        start: "2026-07-13",
        end: "2026-08-21",
        progress: 75,
        phase: "DET",
        lot: "09",
      },
      {
        title: "Électricité - 1re phase",
        start: "2026-07-20",
        end: "2026-08-28",
        progress: 65,
        phase: "DET",
        lot: "10",
      },
      {
        title: "Plomberie - 1re phase",
        start: "2026-07-20",
        end: "2026-08-28",
        progress: 60,
        phase: "DET",
        lot: "11",
      },
      {
        title: "PAC et plancher chauffant",
        start: "2026-08-17",
        end: "2026-09-11",
        progress: 35,
        phase: "DET",
        lot: "12",
      },
      {
        title: "Chapes et revêtements de sols",
        start: "2026-09-07",
        end: "2026-10-02",
        progress: 10,
        phase: "DET",
        lot: "13",
      },
      {
        title: "Menuiseries intérieures",
        start: "2026-09-28",
        end: "2026-10-16",
        progress: 0,
        phase: "DET",
        lot: "14",
      },
      {
        title: "Peinture",
        start: "2026-10-05",
        end: "2026-11-06",
        progress: 0,
        phase: "DET",
        lot: "15",
      },
      {
        title: "Façades",
        start: "2026-08-31",
        end: "2026-09-25",
        progress: 20,
        phase: "DET",
        lot: "16",
      },
      {
        title: "Aménagements extérieurs",
        start: "2026-10-19",
        end: "2026-11-20",
        progress: 0,
        phase: "OPC",
        lot: "17",
      },
      {
        title: "OPR",
        start: "2026-11-30",
        end: "2026-12-04",
        progress: 0,
        phase: "AOR",
        lot: "18",
      },
      {
        title: "Réception",
        start: "2026-12-18",
        end: "2026-12-18",
        progress: 0,
        phase: "AOR",
        milestone: true,
      },
    ],
  },
  {
    reference: "BAT-2026-002",
    name: "Rénovation Longère Saint-Malo",
    address: "Le Haut Salmon, 35400 Saint-Malo",
    description:
      "Rénovation complète d’une longère en pierre : curage, reprises structurelles, isolation biosourcée et pompe à chaleur.",
    status: ProjectStatus.CONSTRUCTION,
    progress: 68,
    worksBudget: 320000,
    feesBudget: 41600,
    startDate: "2026-01-12",
    endDate: "2026-09-25",
    client: 1,
    phaseProgress: {
      ESQ: 100,
      APS: 100,
      APD: 100,
      PRO: 100,
      DCE: 100,
      ACT: 100,
      VISA: 90,
      DET: 68,
      OPC: 70,
      AOR: 5,
    },
    schedule: [
      {
        title: "Diagnostic structure et amiante",
        start: "2026-01-12",
        end: "2026-01-23",
        progress: 100,
        phase: "PRO",
      },
      {
        title: "Curage et déconstruction",
        start: "2026-02-02",
        end: "2026-02-20",
        progress: 100,
        phase: "DET",
        lot: "01",
      },
      {
        title: "Reprises en sous-œuvre",
        start: "2026-02-23",
        end: "2026-03-20",
        progress: 100,
        phase: "DET",
        lot: "03",
      },
      {
        title: "Maçonnerie pierre",
        start: "2026-03-09",
        end: "2026-04-17",
        progress: 100,
        phase: "DET",
        lot: "05",
      },
      {
        title: "Charpente et couverture",
        start: "2026-04-06",
        end: "2026-05-15",
        progress: 100,
        phase: "DET",
        lot: "07",
      },
      {
        title: "Menuiseries extérieures",
        start: "2026-05-11",
        end: "2026-05-29",
        progress: 100,
        phase: "DET",
        lot: "08",
      },
      {
        title: "Isolation biosourcée",
        start: "2026-05-25",
        end: "2026-06-26",
        progress: 100,
        phase: "DET",
        lot: "09",
      },
      {
        title: "Électricité et plomberie",
        start: "2026-06-08",
        end: "2026-07-17",
        progress: 80,
        phase: "DET",
        lot: "10",
      },
      {
        title: "Pompe à chaleur",
        start: "2026-07-06",
        end: "2026-07-24",
        progress: 70,
        phase: "DET",
        lot: "12",
      },
      {
        title: "Sols et faïences",
        start: "2026-07-20",
        end: "2026-08-14",
        progress: 45,
        phase: "DET",
        lot: "13",
      },
      {
        title: "Peinture et finitions",
        start: "2026-08-03",
        end: "2026-09-04",
        progress: 20,
        phase: "DET",
        lot: "15",
      },
      {
        title: "OPR",
        start: "2026-09-14",
        end: "2026-09-18",
        progress: 0,
        phase: "AOR",
        lot: "18",
      },
      {
        title: "Réception",
        start: "2026-09-25",
        end: "2026-09-25",
        progress: 0,
        phase: "AOR",
        milestone: true,
      },
    ],
  },
  {
    reference: "BAT-2026-003",
    name: "Extension Groupe Scolaire Bruz",
    address: "18 avenue Jules Tricault, 35170 Bruz",
    description:
      "Extension de 1 250 m² comprenant huit classes, restauration, préau et mise en conformité accessibilité.",
    status: ProjectStatus.CONSTRUCTION,
    progress: 25,
    worksBudget: 1850000,
    feesBudget: 222000,
    startDate: "2026-03-02",
    endDate: "2027-02-12",
    client: 2,
    phaseProgress: {
      ESQ: 100,
      APS: 100,
      APD: 100,
      PRO: 100,
      DCE: 100,
      ACT: 90,
      VISA: 40,
      DET: 25,
      OPC: 28,
      AOR: 0,
    },
    schedule: [
      {
        title: "Études APS / APD",
        start: "2026-03-02",
        end: "2026-04-24",
        progress: 100,
        phase: "APD",
      },
      {
        title: "Études PRO et DCE",
        start: "2026-04-27",
        end: "2026-06-19",
        progress: 100,
        phase: "DCE",
      },
      {
        title: "Consultation des entreprises",
        start: "2026-06-22",
        end: "2026-07-31",
        progress: 100,
        phase: "ACT",
      },
      {
        title: "Préparation de chantier",
        start: "2026-08-17",
        end: "2026-09-04",
        progress: 100,
        phase: "OPC",
        lot: "01",
      },
      {
        title: "Terrassement et fondations",
        start: "2026-09-07",
        end: "2026-10-16",
        progress: 70,
        phase: "DET",
        lot: "03",
      },
      {
        title: "Gros œuvre",
        start: "2026-10-05",
        end: "2026-12-11",
        progress: 35,
        phase: "DET",
        lot: "05",
      },
      {
        title: "Charpente bois",
        start: "2026-11-30",
        end: "2027-01-08",
        progress: 10,
        phase: "DET",
        lot: "06",
      },
      {
        title: "Clos-couvert",
        start: "2026-12-14",
        end: "2027-01-29",
        progress: 0,
        phase: "DET",
        lot: "07",
      },
      {
        title: "Lots techniques",
        start: "2027-01-04",
        end: "2027-02-05",
        progress: 0,
        phase: "DET",
        lot: "10",
      },
      {
        title: "Commission de sécurité",
        start: "2027-02-08",
        end: "2027-02-08",
        progress: 0,
        phase: "AOR",
        milestone: true,
      },
      {
        title: "Réception",
        start: "2027-02-12",
        end: "2027-02-12",
        progress: 0,
        phase: "AOR",
        milestone: true,
      },
    ],
  },
  {
    reference: "BAT-2026-004",
    name: "Aménagement Bureaux Rennes",
    address: "6 rue du Chêne Germain, 35510 Cesson-Sévigné",
    description:
      "Aménagement de 2 100 m² de bureaux : flex-office, salles de réunion, CVC, sûreté et mobilier.",
    status: ProjectStatus.RECEPTION,
    progress: 83,
    worksBudget: 675000,
    feesBudget: 74250,
    startDate: "2026-02-16",
    endDate: "2026-07-10",
    client: 3,
    phaseProgress: {
      ESQ: 100,
      APS: 100,
      APD: 100,
      PRO: 100,
      DCE: 100,
      ACT: 100,
      VISA: 100,
      DET: 90,
      OPC: 90,
      AOR: 55,
    },
    schedule: [
      {
        title: "Relevés et conception",
        start: "2026-02-16",
        end: "2026-03-06",
        progress: 100,
        phase: "APD",
      },
      {
        title: "Curage",
        start: "2026-03-16",
        end: "2026-03-27",
        progress: 100,
        phase: "DET",
        lot: "01",
      },
      {
        title: "Cloisons et faux plafonds",
        start: "2026-03-30",
        end: "2026-04-24",
        progress: 100,
        phase: "DET",
        lot: "09",
      },
      {
        title: "Courants forts et faibles",
        start: "2026-04-13",
        end: "2026-05-15",
        progress: 100,
        phase: "DET",
        lot: "10",
      },
      {
        title: "CVC",
        start: "2026-04-13",
        end: "2026-05-22",
        progress: 100,
        phase: "DET",
        lot: "12",
      },
      {
        title: "Contrôle d’accès",
        start: "2026-05-04",
        end: "2026-05-22",
        progress: 100,
        phase: "DET",
        lot: "10",
      },
      {
        title: "Revêtements et peinture",
        start: "2026-05-18",
        end: "2026-06-19",
        progress: 90,
        phase: "DET",
        lot: "15",
      },
      {
        title: "Mobilier",
        start: "2026-06-15",
        end: "2026-06-26",
        progress: 80,
        phase: "OPC",
        lot: "14",
      },
      {
        title: "OPR",
        start: "2026-06-29",
        end: "2026-07-03",
        progress: 60,
        phase: "AOR",
        lot: "18",
      },
      {
        title: "Réception",
        start: "2026-07-10",
        end: "2026-07-10",
        progress: 0,
        phase: "AOR",
        milestone: true,
      },
    ],
  },
  {
    reference: "BAT-2026-005",
    name: "Réhabilitation Bâtiment Industriel",
    address: "ZI de la Haie, 35320 Crevin",
    description:
      "Réhabilitation d’un bâtiment industriel de 6 500 m² avec désamiantage, toiture, dallage, ventilation et sécurité incendie.",
    status: ProjectStatus.CONSTRUCTION,
    progress: 12,
    worksBudget: 2400000,
    feesBudget: 264000,
    startDate: "2026-09-07",
    endDate: "2027-05-28",
    client: 4,
    phaseProgress: {
      ESQ: 100,
      APS: 100,
      APD: 100,
      PRO: 100,
      DCE: 100,
      ACT: 80,
      VISA: 20,
      DET: 12,
      OPC: 15,
      AOR: 0,
    },
    schedule: [
      {
        title: "Diagnostic structure",
        start: "2026-09-07",
        end: "2026-09-25",
        progress: 100,
        phase: "PRO",
      },
      {
        title: "Désamiantage",
        start: "2026-10-05",
        end: "2026-11-06",
        progress: 60,
        phase: "DET",
        lot: "01",
      },
      {
        title: "Renforcement de charpente",
        start: "2026-11-02",
        end: "2026-12-18",
        progress: 15,
        phase: "DET",
        lot: "06",
      },
      {
        title: "Réfection de toiture",
        start: "2026-11-30",
        end: "2027-01-29",
        progress: 0,
        phase: "DET",
        lot: "07",
      },
      {
        title: "Dallage industriel",
        start: "2027-01-04",
        end: "2027-02-12",
        progress: 0,
        phase: "DET",
        lot: "13",
      },
      {
        title: "Électricité industrielle",
        start: "2027-02-01",
        end: "2027-03-26",
        progress: 0,
        phase: "DET",
        lot: "10",
      },
      {
        title: "Ventilation process",
        start: "2027-02-15",
        end: "2027-04-09",
        progress: 0,
        phase: "DET",
        lot: "12",
      },
      {
        title: "Sécurité incendie",
        start: "2027-03-15",
        end: "2027-04-23",
        progress: 0,
        phase: "DET",
        lot: "18",
      },
      {
        title: "Marquage et finitions",
        start: "2027-04-19",
        end: "2027-05-07",
        progress: 0,
        phase: "OPC",
        lot: "15",
      },
      {
        title: "Essais et réception",
        start: "2027-05-10",
        end: "2027-05-28",
        progress: 0,
        phase: "AOR",
        lot: "18",
      },
      {
        title: "Réception",
        start: "2027-05-28",
        end: "2027-05-28",
        progress: 0,
        phase: "AOR",
        milestone: true,
      },
    ],
  },
];

async function main() {
  console.log("Initialisation des données de démonstration BatiPilot…");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@batipilot.local" },
  });
  let organization = existingAdmin
    ? await prisma.organization.findUniqueOrThrow({
        where: { id: existingAdmin.organizationId },
      })
    : await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });

  if (!organization) {
    organization = await prisma.organization.create({
      data: { name: "BatiPilot Démonstration" },
    });
  }

  const admin =
    existingAdmin ??
    (await prisma.user.create({
      data: {
        email: "admin@batipilot.local",
        name: "Administrateur BatiPilot",
        passwordHash: passwordHash("ChangeMe!2026"),
        role: "ADMIN",
        status: "ACTIVE",
        jobTitle: "Administrateur",
        organizationId: organization.id,
      },
    }));

  await prisma.$transaction(async (tx) => {
    // Remise à zéro des données métier pour garantir exactement cinq chantiers.
    // Les utilisateurs, dont admin@batipilot.local, sont conservés.
    await tx.project.deleteMany({ where: { organizationId: organization!.id } });
    await tx.client.deleteMany({ where: { organizationId: organization!.id } });
    await tx.company.deleteMany({ where: { organizationId: organization!.id } });
  });

  const createdClients = [];
  for (const [name, email, address] of clients) {
    createdClients.push(
      await prisma.client.create({
        data: {
          name,
          email,
          address,
          phone: "02 99 00 00 00",
          organizationId: organization.id,
        },
      }),
    );
  }

  const companies = new Map<string, { id: string; name: string }>();
  for (const [name, trade] of companySeeds) {
    const company = await prisma.company.create({
      data: {
        name,
        trade,
        email: `${name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, ".")
          .replace(/^\.|\.$/g, "")}@example.test`,
        phone: "02 99 10 20 30",
        organizationId: organization.id,
      },
    });
    companies.set(trade, company);
  }

  for (const seed of projects) {
    console.log(`Création de ${seed.reference} - ${seed.name}`);
    const project = await prisma.project.create({
      data: {
        reference: seed.reference,
        name: seed.name,
        address: seed.address,
        description: seed.description,
        status: seed.status,
        progress: seed.progress,
        worksBudget: money(seed.worksBudget),
        feesBudget: money(seed.feesBudget),
        startDate: d(seed.startDate),
        endDate: d(seed.endDate),
        organizationId: organization.id,
        clientId: createdClients[seed.client].id,
      },
    });

    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: admin.id,
        projectRole: "Chef de projet",
      },
    });

    const phases = new Map<string, { id: string }>();
    for (let i = 0; i < phaseTemplates.length; i++) {
      const [code, name] = phaseTemplates[i];
      const phase = await prisma.phase.create({
        data: {
          code,
          name,
          progress: seed.phaseProgress[code] ?? 0,
          projectId: project.id,
          startDate: i < 6 ? d(seed.startDate) : d(seed.schedule[0].start),
          endDate:
            i < 6
              ? d(seed.schedule[Math.min(2, seed.schedule.length - 1)].end)
              : d(seed.endDate),
        },
      });
      phases.set(code, phase);
      await prisma.deliverable.create({
        data: {
          name: `${code} - Livrable principal`,
          dueAt: phase.endDate,
          status:
            phase.progress === 100
              ? ApprovalStatus.APPROVED
              : ApprovalStatus.PENDING,
          phaseId: phase.id,
        },
      });
    }

    const lots = new Map<string, { id: string }>();
    for (const [number, name, trade] of lotTemplates) {
      const company = companies.get(trade);
      const lot = await prisma.lot.create({
        data: {
          number,
          name,
          projectId: project.id,
          companyId: company?.id,
          estimate: money(Math.round(seed.worksBudget / lotTemplates.length)),
          contractAmount: money(
            Math.round((seed.worksBudget * 0.96) / lotTemplates.length),
          ),
        },
      });
      lots.set(number, lot);
    }

    const planningIds: string[] = [];
    for (const item of seed.schedule) {
      const planning = await prisma.planningTask.create({
        data: {
          title: item.title,
          start: d(item.start),
          end: d(item.end),
          progress: item.progress,
          milestone: item.milestone ?? false,
          projectId: project.id,
          phaseId: phases.get(item.phase)?.id,
          lotId: item.lot ? lots.get(item.lot)?.id : undefined,
          baselineStart: d(item.start),
          baselineEnd: d(item.end),
          dependencyIds:
            item.dependencies
              ?.map((index) => planningIds[index])
              .filter(Boolean) ?? [],
        },
      });
      planningIds.push(planning.id);
    }

    const taskRows = [
      [
        "Valider les plans d’exécution",
        "VISA",
        TaskStatus.IN_PROGRESS,
        Priority.HIGH,
        14,
      ],
      [
        "Préparer le prochain compte rendu de chantier",
        "DET",
        TaskStatus.TODO,
        Priority.NORMAL,
        4,
      ],
      [
        "Contrôler les situations de travaux",
        "DET",
        TaskStatus.REVIEW,
        Priority.HIGH,
        7,
      ],
      [
        "Mettre à jour le planning OPC",
        "OPC",
        TaskStatus.IN_PROGRESS,
        Priority.HIGH,
        6,
      ],
      [
        "Vérifier les fiches techniques entreprises",
        "VISA",
        TaskStatus.TODO,
        Priority.NORMAL,
        8,
      ],
      [
        "Organiser la visite de pré-réception",
        "AOR",
        TaskStatus.TODO,
        Priority.NORMAL,
        5,
      ],
      [
        "Suivre la levée des réserves",
        "AOR",
        TaskStatus.TODO,
        Priority.HIGH,
        10,
      ],
      [
        "Archiver les documents validés",
        "DET",
        TaskStatus.DONE,
        Priority.LOW,
        3,
      ],
    ] as const;
    for (let i = 0; i < taskRows.length; i++) {
      const [title, phaseCode, status, priority, hours] = taskRows[i];
      await prisma.workTask.create({
        data: {
          title,
          description: `${title} pour le chantier ${seed.name}.`,
          status,
          priority,
          startAt: d(seed.startDate),
          dueAt: d(
            seed.schedule[Math.min(i + 2, seed.schedule.length - 1)].end,
          ),
          plannedHours: hours,
          actualHours:
            status === TaskStatus.DONE
              ? hours
              : Math.round((hours * seed.progress) / 100),
          projectId: project.id,
          phaseId: phases.get(phaseCode)?.id,
          assigneeId: admin.id,
        },
      });
    }

    const observationRows = [
      [
        "Contrôle des supports avant intervention",
        "Zone principale",
        Priority.HIGH,
        ObservationStatus.OPEN,
        "05",
      ],
      [
        "Protection des ouvrages existants à compléter",
        "Accès chantier",
        Priority.NORMAL,
        ObservationStatus.TO_VERIFY,
        "01",
      ],
      [
        "Reprise ponctuelle de finition",
        "Façade nord",
        Priority.NORMAL,
        ObservationStatus.CORRECTED,
        "16",
      ],
      [
        "Nettoyage et évacuation des déchets",
        "Zone de stockage",
        Priority.LOW,
        ObservationStatus.CLOSED,
        "01",
      ],
    ] as const;
    for (let i = 0; i < observationRows.length; i++) {
      const [title, location, priority, status, lotNo] = observationRows[i];
      const lot = lots.get(lotNo)!;
      const companyId = (
        await prisma.lot.findUnique({
          where: { id: lot.id },
          select: { companyId: true },
        })
      )?.companyId;
      await prisma.observation.create({
        data: {
          title,
          description: `${title}. Action à intégrer au prochain compte rendu.`,
          location,
          priority,
          status,
          dueAt: d(
            seed.schedule[Math.min(i + 3, seed.schedule.length - 1)].end,
          ),
          projectId: project.id,
          lotId: lot.id,
          companyId: companyId ?? undefined,
          photos: [],
        },
      });
    }

    const docs = [
      ["Notice architecturale.pdf", "CONCEPTION"],
      ["Planning travaux V1.pdf", "PLANNING"],
      ["CR chantier 001.pdf", "COMPTE_RENDU"],
      ["Plan RDC indice C.pdf", "PLANS"],
      ["Tableau des visas.xlsx", "VISA"],
    ];
    for (const [name, category] of docs) {
      await prisma.document.create({
        data: {
          name,
          category,
          mimeType: name.endsWith(".xlsx")
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf",
          storageKey: `demo/${seed.reference}/${name}`,
          visibility: DocumentVisibility.INTERNAL,
          approvalStatus:
            category === "PLANS"
              ? ApprovalStatus.APPROVED
              : ApprovalStatus.DRAFT,
          projectId: project.id,
        },
      });
    }

    const budgetCategories = [
      "Gros œuvre",
      "Clos couvert",
      "Lots techniques",
      "Second œuvre",
      "Aménagements extérieurs",
    ];
    for (let i = 0; i < budgetCategories.length; i++) {
      const budget = Math.round(seed.worksBudget / budgetCategories.length);
      const ratio = Math.min(
        1,
        seed.progress / 100 + (i % 2 === 0 ? 0.08 : -0.05),
      );
      await prisma.budgetLine.create({
        data: {
          label: budgetCategories[i],
          category: "TRAVAUX",
          budget: money(budget),
          committed: money(Math.round(budget * Math.max(0, ratio))),
          paid: money(Math.round(budget * Math.max(0, ratio - 0.18))),
          projectId: project.id,
        },
      });
    }

    await prisma.meeting.create({
      data: {
        number: 1,
        date: d(seed.schedule[Math.min(4, seed.schedule.length - 1)].start),
        weather: "Couvert, 14 °C",
        attendees: ["Maîtrise d’ouvrage", "Maîtrise d’œuvre", "Entreprises"],
        notes: [
          { topic: "Planning", decision: "Maintien de la date contractuelle" },
          {
            topic: "Sécurité",
            decision: "Rappel des règles d’accès au chantier",
          },
        ],
        publishedAt: d(
          seed.schedule[Math.min(4, seed.schedule.length - 1)].end,
        ),
        projectId: project.id,
      },
    });

    if (seed.status === ProjectStatus.RECEPTION || seed.progress >= 80) {
      const reception = await prisma.reception.create({
        data: {
          date: d(seed.endDate),
          status: "PLANIFIEE",
          projectId: project.id,
        },
      });
      await prisma.reserve.createMany({
        data: [
          {
            title: "Reprise de peinture ponctuelle",
            location: "Circulation principale",
            status: ObservationStatus.OPEN,
            dueAt: d(seed.endDate),
            receptionId: reception.id,
          },
          {
            title: "Réglage d’une menuiserie",
            location: "Salle de réunion",
            status: ObservationStatus.TO_VERIFY,
            dueAt: d(seed.endDate),
            receptionId: reception.id,
          },
        ],
      });
    }
  }

  console.log(
    "Seed terminé : 5 chantiers, lots, Gantt, tâches, entreprises, observations, documents et budgets créés.",
  );
  console.log("Compte admin conservé/créé : admin@batipilot.local");
}

main()
  .catch((error) => {
    console.error("Échec du seed BatiPilot :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
