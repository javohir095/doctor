import { Fragment } from "react"
import { format } from "date-fns"
import { ClipboardList } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/shared/ui/EmptyState"
import { useProfile } from "@/entities/session/api/queries"
import {
  usePatientTreatmentPlans,
  useTreatmentPlanBalances,
  usePatientPayments,
} from "@/entities/treatments/api/queries"
import { TREATMENT_PLAN_STATUS_LABELS, PAYMENT_TYPE_LABELS } from "@/entities/treatments/model/types"
import { NewTreatmentPlanDialog } from "./NewTreatmentPlanDialog"
import { RecordPaymentDialog } from "./RecordPaymentDialog"

function money(n: number) {
  return `${n.toLocaleString("uz-UZ")} so'm`
}

export function PatientTreatmentTab({ patientId }: { patientId: string }) {
  const { data: profile } = useProfile()
  const { data: plans, isLoading: plansLoading } = usePatientTreatmentPlans(patientId)
  const { data: balances } = useTreatmentPlanBalances(patientId)
  const { data: payments } = usePatientPayments(patientId)

  const canManagePlans = profile?.role === "owner" || profile?.role === "doctor"
  const canRecordPayments = profile?.role === "owner" || profile?.role === "admin"

  if (plansLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {canManagePlans && profile && (
        <div className="flex justify-end">
          <NewTreatmentPlanDialog patientId={patientId} doctorId={profile.id} />
        </div>
      )}

      {(!plans || plans.length === 0) && (
        <EmptyState icon={ClipboardList} title="Hozircha davolash rejasi yo'q" />
      )}

      <div className="space-y-4">
        {plans?.map((plan) => {
          const balance = balances?.find((b) => b.treatment_plan_id === plan.id)
          const remaining = balance?.remaining_amount ?? plan.total_amount
          return (
            <Card key={plan.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">
                    {plan.title || "Davolash rejasi"}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shifokor: {plan.doctor?.full_name ?? "—"} ·{" "}
                    {format(new Date(plan.created_at), "dd.MM.yyyy")}
                  </p>
                </div>
                <Badge variant={plan.status === "active" ? "outline" : "secondary"}>
                  {TREATMENT_PLAN_STATUS_LABELS[plan.status]}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  {plan.treatment_items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.service_name} × {item.quantity}
                      </span>
                      <span>{money(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Umumiy</p>
                    <p className="font-medium">{money(plan.total_amount)}</p>
                  </div>
                  {canRecordPayments && (
                    <>
                      <div>
                        <p className="text-muted-foreground">To'langan</p>
                        <p className="font-medium text-success">
                          {money(balance?.paid_amount ?? 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Qolgan</p>
                        <p className="font-medium text-destructive">
                          {money(remaining)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                {canRecordPayments && remaining > 0 && (
                  <RecordPaymentDialog
                    patientId={patientId}
                    treatmentPlanId={plan.id}
                    remainingAmount={remaining}
                  />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {canRecordPayments && payments && payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">To'lovlar tarixi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {payments.map((payment) => (
              <Fragment key={payment.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(payment.paid_at), "dd.MM.yyyy HH:mm")} ·{" "}
                    {PAYMENT_TYPE_LABELS[payment.payment_type]}
                  </span>
                  <span className="font-medium">{money(payment.amount)}</span>
                </div>
                <Separator className="last:hidden" />
              </Fragment>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
