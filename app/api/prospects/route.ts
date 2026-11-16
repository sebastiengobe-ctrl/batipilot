import { db } from "@/lib/db";
import { requireUser, fail } from "@/lib/auth";
import { assertAction } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import {
  text,
  optionalText,
  numberValue,
} from "@/lib/validation";

export async function GET() {
  try {
    const u = await requireUser();

    const prospects = await db.prospect.findMany({
      where: {
        organizationId: u.organizationId,
      },
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            activities: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return Response.json(prospects);
  } catch (e) {
    return fail(e);
  }
}

export async function POST(r: Request) {
  try {
    const u = await requireUser();

    assertAction(u.role, "create");

    const b = await r.json();

    const prospect = await db.$transaction(async (tx) => {
      const created = await tx.prospect.create({
        data: {
          firstName: optionalText(b.firstName, 100),
          lastName: text(b.lastName, "Nom", 100),
          email: optionalText(b.email, 200),
          phone: optionalText(b.phone, 50),
          projectAddress: optionalText(b.projectAddress, 500),
          projectType: optionalText(b.projectType, 100),
          constructionType: optionalText(b.constructionType, 50),
          source: optionalText(b.source, 100),

          status: b.status || "NEW",

          probability: numberValue(
            b.probability ?? 10,
            "Probabilite"
          ),

          worksBudget:
            b.worksBudget !== undefined &&
            b.worksBudget !== null &&
            b.worksBudget !== ""
              ? numberValue(b.worksBudget, "Budget")
              : null,

          feesEstimate:
            b.feesEstimate !== undefined &&
            b.feesEstimate !== null &&
            b.feesEstimate !== ""
              ? numberValue(b.feesEstimate, "Honoraires")
              : null,

          nextAction: optionalText(b.nextAction),
          comment: optionalText(b.comment),

          responsibleId: b.responsibleId || null,

          organizationId: u.organizationId,
        },
      });

      await audit(tx, {
        organizationId: u.organizationId,
        userId: u.id,
        action: "CREATE",
        entity: "Prospect",
        entityId: created.id,
        newValue: created,
      });

      return created;
    });

    return Response.json(prospect, {
      status: 201,
    });
  } catch (e) {
    return fail(e);
  }
}