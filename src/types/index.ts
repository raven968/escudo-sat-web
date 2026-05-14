export type PlanKey = 'free' | 'starter' | 'profesional' | 'despacho'

export interface Plan {
  key: PlanKey
  name: string
  rfc_limit: number
  price_mxn: number
  is_current: boolean
}

export interface SubscriptionCurrent {
  plan: PlanKey
  plan_name: string
  rfc_limit: number
  rfc_count: number
  price_mxn: number
  status: 'free' | 'active' | 'past_due' | 'cancelled' | 'trialing' | 'paused'
}

export interface Tenant {
  id: string
  name: string
  email: string
  rfc_limit: number | null
  subscription_plan: PlanKey | null
  subscription_status: string | null
  stripe_id: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  tenant_id: string
  name: string
  email: string
  role: 'admin' | 'contador' | 'asistente'
  tenant?: Tenant
  created_at: string
  updated_at: string
}

export interface RfcAccount {
  id: string
  tenant_id: string
  rfc: string
  razon_social: string
  regimen_fiscal: string
  csd_expiration_date: string | null
  fiel_expiration_date: string | null
  is_active: boolean
  last_sync_at: string | null
  last_sync_status: 'success' | 'failed' | 'pending' | null
  created_at: string
  updated_at: string
}

export interface Cfdi {
  id: string
  rfc_account_id: string
  uuid_fiscal: string
  tipo_comprobante: 'I' | 'E' | 'P' | 'N' | 'T'
  serie: string | null
  folio: string | null
  fecha_emision: string
  rfc_emisor: string
  nombre_emisor: string
  rfc_receptor: string
  nombre_receptor: string
  subtotal: number
  total: number
  moneda: string
  tipo_cambio: number
  metodo_pago: string | null
  forma_pago: string | null
  uso_cfdi: string | null
  estatus: 'vigente' | 'cancelado'
  efecto_comprobante: string | null
  xml_s3_path: string | null
  is_suspicious: boolean
  suspicion_reason: string | null
  direction: 'emitido' | 'recibido'
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  rfc_account_id: string
  cfdi_id: string | null
  type:
    | 'factura_sospechosa'
    | 'csd_por_vencer'
    | 'fiel_por_vencer'
    | 'proveedor_nuevo_monto_alto'
    | 'sat_caido'
    | 'sync_fallida'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  is_read: boolean
  is_resolved: boolean
  notified_via: string[]
  created_at: string
  updated_at: string
}

export interface SatStatus {
  is_available: boolean
  response_time_ms: number | null
  checked_at: string
}

export interface SatStatusLog extends SatStatus {
  id: number
  check_type: 'web_service' | 'portal'
  error_message: string | null
}

export interface DashboardSummary {
  total_rfcs: number
  rfcs_activos: number
  total_cfdis: number
  cfdis_este_mes: number
  alertas_sin_leer: number
  sat_disponible: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
