import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerImportSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const configuredApiKey = process.env.BASE_AGENCY_API_KEY;
  const requestApiKey = request.headers.get("x-api-key");

  if (!configuredApiKey) {
    return NextResponse.json(
      { success: false, message: "BASE_AGENCY_API_KEY is not configured" },
      { status: 500 }
    );
  }

  if (!requestApiKey || requestApiKey !== configuredApiKey) {
    return NextResponse.json(
      { success: false, message: "Invalid or missing API key" },
      { status: 401 }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = customerImportSchema.safeParse(payload);

  if (!parsed.success) {
    await prisma.websiteSyncLog.create({
      data: {
        status: "FAILED",
        message: "Validation failed",
        payload: payload as object
      }
    });

    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors
      },
      { status: 422 }
    );
  }

  const data = parsed.data;

  try {
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          ...(data.phone ? [{ phone: data.phone }] : []),
          ...(data.email ? [{ email: data.email }] : [])
        ]
      }
    });

    const customerData = {
      fullName: data.full_name,
      phone: data.phone || null,
      whatsapp: data.whatsapp || data.phone || null,
      email: data.email || null,
      address: data.address || null,
      source: data.source || "website",
      serviceInterest: data.service_interest || null,
      status: data.status || "NEW",
      notes: data.notes || null
    };

    const customer = existingCustomer
      ? await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: customerData
        })
      : await prisma.customer.create({
          data: customerData
        });

    const syncStatus = existingCustomer ? "UPDATED" : "CREATED";

    await prisma.websiteSyncLog.create({
      data: {
        customerId: customer.id,
        source: data.source || "website",
        status: syncStatus,
        message: existingCustomer
          ? "Customer updated from website import"
          : "Customer created from website import",
        payload: data
      }
    });

    return NextResponse.json({
      success: true,
      action: syncStatus.toLowerCase(),
      message: existingCustomer ? "Customer updated" : "Customer created",
      customer: {
        id: customer.id,
        full_name: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        status: customer.status
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown import error";

    await prisma.websiteSyncLog.create({
      data: {
        status: "FAILED",
        message,
        payload: data
      }
    });

    return NextResponse.json(
      { success: false, message: "Customer import failed" },
      { status: 500 }
    );
  }
}
