import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Eye,
  X,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Ban,
  Check,
  Clock,
  Lock,
  Send,
  UserCheck,
  Coins,
  Receipt,
  KeyRound,
  Copy,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { CustomerUser } from '../types';
import {
  fetchFeeConfigurations,
  fetchPaymentTransactionsFromDb,
  waiveUserFeeInDb,
  generateUserPasswordByAdmin,
  PaymentTransactionRecord,
} from '../../services/dbService';

interface UsersTabProps {
  onExitToCustomerApp?: () => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({ onExitToCustomerApp }) => {
  const {
    customers,
    updateCustomerStatus,
    verifyCustomerEmail,
    resendCustomerEmailVerification,
    confirmUserPayment,
    rejectUserPayment,
    bookings,
    payments,
    complaints,
    impersonateCustomer,
    currentAdmin,
  } = useSuperAdmin();

  const [dbTransactions, setDbTransactions] = useState<PaymentTransactionRecord[]>([]);
  const [companionFeeAmount, setCompanionFeeAmount] = useState<number>(499);
  const [customerFeeAmount, setCustomerFeeAmount] = useState<number>(0);
  const [selectedTxForDetails, setSelectedTxForDetails] = useState<PaymentTransactionRecord | null>(null);
  const [waivingUser, setWaivingUser] = useState<CustomerUser | null>(null);
  const [waiveReason, setWaiveReason] = useState('Super Admin promotional waiver');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'companion' | 'admin'>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [emailFilter, setEmailFilter] = useState<'all' | 'verified' | 'not_verified'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerUser | null>(null);
  const [resendNotification, setResendNotification] = useState<string | null>(null);

  // Super Admin Password Management State
  const isSuperAdmin = currentAdmin?.role === 'super_admin' || (currentAdmin as any)?.role === 'owner';
  const [passwordTargetUser, setPasswordTargetUser] = useState<CustomerUser | null>(null);
  const [generatingPassword, setGeneratingPassword] = useState(false);
  const [generatedPasswordResult, setGeneratedPasswordResult] = useState<{
    password: string;
    expiresAt: string;
    user: CustomerUser;
  } | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [passwordGenError, setPasswordGenError] = useState<string | null>(null);

  const loadData = () => {
    fetchFeeConfigurations().then((res) => {
      if (res.success) {
        setCompanionFeeAmount(res.companionRegistrationFee ?? 499);
        setCustomerFeeAmount(res.customerRegistrationFee ?? 0);
      }
    });
    fetchPaymentTransactionsFromDb().then((res) => {
      if (res.success && Array.isArray(res.transactions)) {
        setDbTransactions(res.transactions);
      }
    });
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const getUserTransaction = (userId: string) => {
    return dbTransactions.find(
      (tx) => tx.userId === userId || (tx as any).user_id === userId
    );
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);

    const userRole = (c.role || 'customer').toLowerCase();
    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'customer' && (userRole === 'customer' || userRole === 'user')) ||
      (roleFilter === 'companion' && userRole === 'companion') ||
      (roleFilter === 'admin' && (userRole === 'owner' || userRole === 'admin'));

    const matchesCity = cityFilter === 'all' || c.city === cityFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesEmail =
      emailFilter === 'all' ||
      (emailFilter === 'verified' && c.emailVerified) ||
      (emailFilter === 'not_verified' && !c.emailVerified);

    return matchesSearch && matchesRole && matchesCity && matchesStatus && matchesEmail;
  });

  const getStatusBadge = (status: CustomerUser['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'suspended':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'blocked':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const handleResendEmail = (cust: CustomerUser) => {
    resendCustomerEmailVerification(cust.id);
    setResendNotification(`Verification email sent to ${cust.email}`);
    setTimeout(() => setResendNotification(null), 3500);
  };

  const handleVerifyEmail = (cust: CustomerUser) => {
    verifyCustomerEmail(cust.id);
    if (selectedCustomer && selectedCustomer.id === cust.id) {
      setSelectedCustomer({ ...selectedCustomer, emailVerified: true });
    }
    setResendNotification(`Email marked as Verified for ${cust.name}`);
    setTimeout(() => setResendNotification(null), 3500);
  };

  const getPasswordStatus = (user: CustomerUser) => {
    if (user.temporaryPassword || user.mustChangePassword) {
      const isExpired = user.passwordExpiresAt && new Date(user.passwordExpiresAt).getTime() < Date.now();
      if (isExpired) {
        return {
          label: 'Temporary Password — Expired',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          dotColor: 'bg-rose-500',
        };
      }
      return {
        label: 'Temporary Password — Change Required',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        dotColor: 'bg-amber-500 animate-pulse',
      };
    }
    return {
      label: 'Normal',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      dotColor: 'bg-emerald-500',
    };
  };

  const handleGeneratePassword = async () => {
    if (!passwordTargetUser) return;
    setGeneratingPassword(true);
    setPasswordGenError(null);
    try {
      const res = await generateUserPasswordByAdmin(passwordTargetUser.id);
      setGeneratingPassword(false);
      if (res.success && res.temporaryPassword) {
        setGeneratedPasswordResult({
          password: res.temporaryPassword,
          expiresAt: res.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          user: passwordTargetUser,
        });
        if (selectedCustomer && selectedCustomer.id === passwordTargetUser.id) {
          setSelectedCustomer({
            ...selectedCustomer,
            mustChangePassword: true,
            temporaryPassword: true,
            passwordExpiresAt: res.expiresAt,
          });
        }
        const found = customers.find((c) => c.id === passwordTargetUser.id);
        if (found) {
          found.mustChangePassword = true;
          found.temporaryPassword = true;
          found.passwordExpiresAt = res.expiresAt;
        }
        setPasswordTargetUser(null);
      } else {
        setPasswordGenError(res.errorMessage || 'Failed to generate temporary password');
      }
    } catch (err: any) {
      setGeneratingPassword(false);
      setPasswordGenError(err.message || 'Network error generating password');
    }
  };

  const customerBookings = selectedCustomer
    ? bookings.filter((b) => b.guestName.toLowerCase() === selectedCustomer.name.toLowerCase())
    : [];

  const customerPayments = selectedCustomer
    ? payments.filter((p) => p.customerName.toLowerCase() === selectedCustomer.name.toLowerCase())
    : [];

  const customerComplaints = selectedCustomer
    ? complaints.filter((c) => c.reporterName.toLowerCase() === selectedCustomer.name.toLowerCase())
    : [];

  return (
    <div className="space-y-6">
      {/* Toast notification banner */}
      {resendNotification && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{resendNotification}</span>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#160b24] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name, email, or phone number..."
            className="w-full bg-[#201033] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer (Booker)</option>
            <option value="companion">Companion (Host)</option>
            <option value="admin">Super Admin / Admin</option>
          </select>

          {/* Email verification filter */}
          <select
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value as any)}
            className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
          >
            <option value="all">All Email Statuses</option>
            <option value="verified">Email: Verified</option>
            <option value="not_verified">Email: Not Verified</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
          >
            <option value="all">All Cities</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Gandhinagar">Gandhinagar</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#201033] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#fd8a42]"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Email &amp; Phone</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Password Status</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">KYC Status</th>
                <th className="py-3.5 px-4">Registration</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-500 font-medium">
                    {customers.length === 0 ? 'No registered users in database yet' : 'No users found matching search criteria.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#fd8a42]/20 border border-[#fd8a42]/30 flex items-center justify-center text-xs font-bold text-[#fd8a42]">
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <span>{cust.name}</span>
                          <span className="block text-[10px] text-slate-500 font-mono">@{cust.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cust.role === 'owner' || cust.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          <ShieldCheck className="w-3 h-3 text-purple-400" /> Super Admin
                        </span>
                      ) : cust.role === 'companion' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#fd8a42]/10 text-[#fd8a42] border border-[#fd8a42]/30">
                          Companion
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/30">
                          Customer
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-200">{cust.email}</div>
                      <div className="text-[10px] text-slate-500">{cust.phone}</div>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {(() => {
                        const userTx = getUserTransaction(cust.id);
                        const isCompanion = cust.role === 'companion';
                        const feeAmt = isCompanion ? companionFeeAmount : customerFeeAmount;

                        if (userTx?.status === 'WAIVED') {
                          return (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Waived (₹{userTx.totalAmount || feeAmt})
                            </span>
                          );
                        }

                        if (cust.registrationFeePaid || cust.paymentStatus === 'Approved' || userTx?.status === 'PAID') {
                          const paidAmt = userTx?.totalAmount ?? feeAmt;
                          return (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Paid (₹{paidAmt})
                            </span>
                          );
                        }

                        if (!isCompanion && customerFeeAmount === 0) {
                          return (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                              Free (₹0)
                            </span>
                          );
                        }

                        if (cust.paymentStatus === 'Rejected' || userTx?.status === 'FAILED') {
                          return (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          );
                        }

                        return (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                            <Clock className="w-3 h-3" /> Pending (₹{feeAmt})
                          </span>
                        );
                      })()}
                    </td>

                    {/* Password Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {(() => {
                        const pw = getPasswordStatus(cust);
                        return (
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${pw.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${pw.dotColor}`} />
                            {pw.label}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                      {cust.city}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cust.idVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ID Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending Upload
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {cust.registrationDate}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${getStatusBadge(cust.status)}`}>
                        {cust.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Payment Details Button */}
                        <button
                          onClick={() => {
                            const userTx = getUserTransaction(cust.id);
                            if (userTx) {
                              setSelectedTxForDetails(userTx);
                            } else {
                              const isComp = cust.role === 'companion';
                              setSelectedTxForDetails({
                                id: `tx_${cust.id}`,
                                userId: cust.id,
                                userName: cust.name,
                                userPhone: cust.phone,
                                userEmail: cust.email,
                                userRole: isComp ? 'COMPANION' : 'CUSTOMER',
                                feeCode: isComp ? 'COMPANION_REGISTRATION' : 'CUSTOMER_REGISTRATION',
                                feeName: isComp ? 'Companion Registration Fee' : 'Customer Registration Fee',
                                baseAmount: isComp ? companionFeeAmount : customerFeeAmount,
                                gstAmount: 0,
                                totalAmount: isComp ? companionFeeAmount : customerFeeAmount,
                                currency: 'INR',
                                status: cust.registrationFeePaid ? 'PAID' : 'PENDING',
                                gateway: 'DIRECT_UPI',
                                orderId: `ord_${cust.id}`,
                                paymentId: `pay_${cust.id}`,
                                transactionId: (cust as any).paymentReference || `TXN_${cust.id}`,
                                paymentMethod: 'UPI',
                                createdAt: cust.registrationDate,
                                updatedAt: cust.registrationDate,
                              });
                            }
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          title="Payment Details"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>

                        {/* Companion Fee Waiver */}
                        {cust.role === 'companion' && !cust.registrationFeePaid && cust.paymentStatus !== 'Approved' && (
                          <button
                            onClick={() => {
                              setWaivingUser(cust);
                              setWaiveReason('Super Admin promotional waiver');
                            }}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                            title="Waive Registration Fee"
                          >
                            <Coins className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            impersonateCustomer(cust);
                            if (onExitToCustomerApp) {
                              onExitToCustomerApp();
                            }
                          }}
                          className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400"
                          title={`Login as Customer (View Marketplace as ${cust.name})`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                          title="View Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Super Admin Password Generation Button */}
                        {isSuperAdmin && cust.role !== 'admin' && cust.role !== 'owner' && (
                          <button
                            onClick={() => {
                              setPasswordTargetUser(cust);
                              setPasswordGenError(null);
                            }}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/20 transition-colors"
                            title={`Generate New Temporary Password for ${cust.name} (Super Admin Only)`}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {!cust.emailVerified && (
                          <button
                            onClick={() => handleResendEmail(cust)}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
                            title="Resend Verification Email"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {cust.status === 'active' ? (
                          <button
                            onClick={() => updateCustomerStatus(cust.id, 'suspended')}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                            title="Suspend Customer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateCustomerStatus(cust.id, 'active')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                            title="Activate Customer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER PROFILE DRAWER / MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#180e26] border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-5 bg-[#201333] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#fd8a42] tracking-wider">
                  Customer Master Record
                </span>
                <h3 className="text-lg font-bold text-white">{selectedCustomer.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Personal & Verification Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Account Details</span>
                  <div className="text-xs text-slate-300 space-y-1.5">
                    <p><span className="text-slate-500">Email:</span> {selectedCustomer.email}</p>
                    <p><span className="text-slate-500">Phone:</span> {selectedCustomer.phone}</p>
                    <p><span className="text-slate-500">City:</span> {selectedCustomer.city}</p>
                    <p><span className="text-slate-500">Registered:</span> {selectedCustomer.registrationDate}</p>
                    <p><span className="text-slate-500">Total Spent:</span> ₹{selectedCustomer.totalSpent}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Verification &amp; Security</span>
                  
                  {/* Registration Fee Payment Status */}
                  <div className="p-3 rounded-xl bg-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold text-white">Registration Fee ({selectedCustomer.role === 'companion' ? 'Companion' : 'Customer'}):</span>
                      </div>
                      {(() => {
                        const userTx = getUserTransaction(selectedCustomer.id);
                        const isComp = selectedCustomer.role === 'companion';
                        const feeAmt = isComp ? companionFeeAmount : customerFeeAmount;
                        if (userTx?.status === 'WAIVED') {
                          return (
                            <span className="text-blue-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Waived by Admin
                            </span>
                          );
                        }
                        if (selectedCustomer.registrationFeePaid || selectedCustomer.paymentStatus === 'Approved' || userTx?.status === 'PAID') {
                          return (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Paid (₹{userTx?.totalAmount || feeAmt})
                            </span>
                          );
                        }
                        if (!isComp && customerFeeAmount === 0) {
                          return (
                            <span className="text-slate-300 font-bold">Free (₹0)</span>
                          );
                        }
                        return (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Pending (₹{feeAmt})
                          </span>
                        );
                      })()}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const userTx = getUserTransaction(selectedCustomer.id);
                          if (userTx) {
                            setSelectedTxForDetails(userTx);
                          } else {
                            const isComp = selectedCustomer.role === 'companion';
                            setSelectedTxForDetails({
                              id: `tx_${selectedCustomer.id}`,
                              userId: selectedCustomer.id,
                              userName: selectedCustomer.name,
                              userPhone: selectedCustomer.phone,
                              userEmail: selectedCustomer.email,
                              userRole: isComp ? 'COMPANION' : 'CUSTOMER',
                              feeCode: isComp ? 'COMPANION_REGISTRATION' : 'CUSTOMER_REGISTRATION',
                              feeName: isComp ? 'Companion Registration Fee' : 'Customer Registration Fee',
                              baseAmount: isComp ? companionFeeAmount : customerFeeAmount,
                              gstAmount: 0,
                              totalAmount: isComp ? companionFeeAmount : customerFeeAmount,
                              currency: 'INR',
                              status: selectedCustomer.registrationFeePaid ? 'PAID' : 'PENDING',
                              gateway: 'DIRECT_UPI',
                              orderId: `ord_${selectedCustomer.id}`,
                              paymentId: `pay_${selectedCustomer.id}`,
                              transactionId: (selectedCustomer as any).paymentReference || `TXN_${selectedCustomer.id}`,
                              paymentMethod: 'UPI',
                              createdAt: selectedCustomer.registrationDate,
                              updatedAt: selectedCustomer.registrationDate,
                            });
                          }
                        }}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <CreditCard className="w-3 h-3" /> View Payment Details
                      </button>

                      {selectedCustomer.role === 'companion' && !selectedCustomer.registrationFeePaid && selectedCustomer.paymentStatus !== 'Approved' && (
                        <button
                          type="button"
                          onClick={() => {
                            setWaivingUser(selectedCustomer);
                            setWaiveReason('Super Admin promotional waiver');
                          }}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-semibold border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                        >
                          <Coins className="w-3 h-3" /> Waive Fee
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment Approve / Reject actions */}
                  {(!selectedCustomer.registrationFeePaid || selectedCustomer.paymentStatus === 'Pending Verification') && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          confirmUserPayment(selectedCustomer.id);
                          setSelectedCustomer({ ...selectedCustomer, registrationFeePaid: true, status: 'active', paymentStatus: 'Approved' });
                          setResendNotification(`Payment approved! Account @${selectedCustomer.id} activated.`);
                          setTimeout(() => setResendNotification(null), 3500);
                        }}
                        className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Check className="w-3 h-3" /> Approve Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          rejectUserPayment(selectedCustomer.id, 'Payment verification rejected by admin');
                          setSelectedCustomer({ ...selectedCustomer, registrationFeePaid: false, status: 'suspended', paymentStatus: 'Rejected' });
                          setResendNotification(`Payment rejected for @${selectedCustomer.id}.`);
                          setTimeout(() => setResendNotification(null), 3500);
                        }}
                        className="py-1.5 px-3 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors border border-rose-500/30"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}

                  {/* Email verification row */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>Email Status:</span>
                    </div>
                    {selectedCustomer.emailVerified ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Not Verified
                      </span>
                    )}
                  </div>

                  {/* Resend / Mark email verified controls */}
                  {!selectedCustomer.emailVerified && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleVerifyEmail(selectedCustomer)}
                        className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Check className="w-3 h-3" /> Mark Email Verified
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResendEmail(selectedCustomer)}
                        className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <Send className="w-3 h-3" /> Resend Email
                      </button>
                    </div>
                  )}

                  {/* Super Admin Password Management in Drawer */}
                  <div className="p-3 rounded-xl bg-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold text-white">Password Status:</span>
                      </div>
                      {(() => {
                        const pw = getPasswordStatus(selectedCustomer);
                        return (
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pw.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${pw.dotColor}`} />
                            {pw.label}
                          </span>
                        );
                      })()}
                    </div>

                    {selectedCustomer.passwordExpiresAt && (selectedCustomer.temporaryPassword || selectedCustomer.mustChangePassword) && (
                      <p className="text-[11px] text-slate-400">
                        Expires: <span className="text-slate-200 font-medium">{new Date(selectedCustomer.passwordExpiresAt).toLocaleString()}</span>
                      </p>
                    )}

                    {isSuperAdmin && selectedCustomer.role !== 'admin' && selectedCustomer.role !== 'owner' && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordTargetUser(selectedCustomer);
                            setPasswordGenError(null);
                          }}
                          className="w-full py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors border border-amber-500/30 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Generate New Password (Super Admin Only)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Identity documents preview */}
                  <div className="pt-1">
                    <p className="text-xs font-semibold text-slate-300 mb-2">Submitted Identity Documents</p>
                    {selectedCustomer.aadhaarImage || selectedCustomer.selfieImage || (selectedCustomer as any).profilePhoto ? (
                      <div className="flex flex-wrap items-center gap-3">
                        {(selectedCustomer as any).profilePhoto && (
                          <div>
                            <p className="text-[10px] text-slate-400 mb-1">Profile Photo</p>
                            <img
                              src={(selectedCustomer as any).profilePhoto}
                              alt="Profile"
                              className="w-14 h-14 object-cover rounded-xl border border-white/20"
                            />
                          </div>
                        )}
                        {selectedCustomer.aadhaarImage ? (
                          <div>
                            <p className="text-[10px] text-slate-400 mb-1">Aadhaar / Govt ID</p>
                            <img
                              src={selectedCustomer.aadhaarImage}
                              alt="Aadhaar"
                              className="w-16 h-12 object-cover rounded-lg border border-white/20"
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="text-[10px] text-slate-400 mb-1">Aadhaar / Govt ID</p>
                            <span className="text-[11px] text-slate-500 italic">Not submitted</span>
                          </div>
                        )}
                        {selectedCustomer.selfieImage ? (
                          <div>
                            <p className="text-[10px] text-slate-400 mb-1">Live Selfie</p>
                            <img
                              src={selectedCustomer.selfieImage}
                              alt="Selfie"
                              className="w-12 h-12 object-cover rounded-full border border-white/20"
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="text-[10px] text-slate-400 mb-1">Live Selfie</p>
                            <span className="text-[11px] text-slate-500 italic">Not submitted</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic p-2 rounded-lg bg-white/5">
                        No KYC verification data available / Not submitted
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bookings by this customer */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Customer Bookings History ({customerBookings.length})
                </h4>
                {customerBookings.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-white/5">No bookings logged for this user yet.</p>
                ) : (
                  <div className="space-y-2">
                    {customerBookings.map((b) => (
                      <div key={b.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white block">#{b.id} with {b.companionName}</span>
                          <span className="text-[11px] text-slate-400">{b.date} • {b.venue}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-white block">₹{b.totalFee}</span>
                          <span className="text-[10px] uppercase font-semibold text-[#fd8a42]">{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Change Controls & Impersonation */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-white/10">
                <div className="text-xs text-slate-400">
                  Current Status: <span className="font-bold text-white capitalize">{selectedCustomer.status}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      impersonateCustomer(selectedCustomer);
                      if (onExitToCustomerApp) {
                        onExitToCustomerApp();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-900/40"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>View as Customer</span>
                  </button>

                  <button
                    onClick={() => {
                      updateCustomerStatus(selectedCustomer.id, 'active');
                      setSelectedCustomer({ ...selectedCustomer, status: 'active' });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCustomer.status === 'active'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Activate
                  </button>

                  <button
                    onClick={() => {
                      updateCustomerStatus(selectedCustomer.id, 'suspended');
                      setSelectedCustomer({ ...selectedCustomer, status: 'suspended' });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCustomer.status === 'suspended'
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Suspend
                  </button>

                    <button
                    onClick={() => {
                      updateCustomerStatus(selectedCustomer.id, 'blocked');
                      setSelectedCustomer({ ...selectedCustomer, status: 'blocked' });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCustomer.status === 'blocked'
                        ? 'bg-red-500 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Block User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT DETAILS POPUP MODAL */}
      {selectedTxForDetails && (
        <div className="fixed inset-0 z-50 bg-[#12001f]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-[#1a0c2e] border border-white/20 w-full max-w-lg rounded-3xl shadow-2xl p-6 text-white space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#fd8a42]" />
                <h3 className="font-bold text-base text-white">Payment Transaction Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxForDetails(null)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Transaction ID</span>
                  <span className="font-mono font-bold text-[#fd8a42]">{selectedTxForDetails.transactionId || selectedTxForDetails.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Gateway Order ID</span>
                  <span className="font-mono text-slate-300">{selectedTxForDetails.orderId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Gateway Payment ID</span>
                  <span className="font-mono text-slate-300">{selectedTxForDetails.paymentId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Payment Gateway</span>
                  <span className="font-bold text-white">{selectedTxForDetails.gateway || 'RAZORPAY'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">User / Customer</span>
                  <span className="font-semibold text-white">{selectedTxForDetails.userName}</span>
                  <span className="text-[10px] text-slate-400 block">@{selectedTxForDetails.userId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">User Role</span>
                  <span className="font-bold text-purple-300">{selectedTxForDetails.userRole}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Fee Type</span>
                  <span className="font-semibold text-white">{selectedTxForDetails.feeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Status</span>
                  <span className="font-bold text-emerald-400 uppercase">{selectedTxForDetails.status}</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Base Amount:</span>
                  <span className="font-semibold text-white">₹{selectedTxForDetails.baseAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">GST Amount:</span>
                  <span className="font-semibold text-white">₹{selectedTxForDetails.gstAmount}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-white/10 font-bold text-sm text-[#fd8a42]">
                  <span>Total Amount Paid:</span>
                  <span>₹{selectedTxForDetails.totalAmount} {selectedTxForDetails.currency || 'INR'}</span>
                </div>
              </div>

              {selectedTxForDetails.waivedBy && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-blue-300 uppercase">Fee Waived by Admin</div>
                  <div className="text-[11px] text-blue-200">
                    Admin: <strong>{selectedTxForDetails.waivedBy}</strong> | Reason: {selectedTxForDetails.waiveReason}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTxForDetails(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WAIVE COMPANION FEE MODAL */}
      {waivingUser && (
        <div className="fixed inset-0 z-50 bg-[#12001f]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const adminId = currentAdmin?.id || currentAdmin?.username || 'superadmin';
              const res = await waiveUserFeeInDb(waivingUser.id, 'COMPANION_REGISTRATION', waiveReason, adminId);
              if (res.success) {
                setResendNotification(`Registration fee WAIVED for ${waivingUser.name}.`);
                setTimeout(() => setResendNotification(null), 3500);
                setWaivingUser(null);
                loadData();
              } else {
                alert(res.errorMessage || 'Failed to waive fee.');
              }
            }}
            className="bg-[#1a0c2e] border border-amber-500/30 w-full max-w-md rounded-3xl shadow-2xl p-6 text-white space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Waive Companion Registration Fee</h3>
              </div>
              <button
                type="button"
                onClick={() => setWaivingUser(null)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Override and mark registration fee as WAIVED for companion <strong>{waivingUser.name}</strong> (@{waivingUser.id}).
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Reason for Waiver (Required for Audit Compliance)
              </label>
              <textarea
                required
                rows={3}
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                placeholder="e.g. Promotional launch waiver or manual verification"
                className="w-full bg-[#201033] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWaivingUser(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg cursor-pointer"
              >
                Confirm &amp; Waive Fee
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONFIRM PASSWORD GENERATION MODAL (SUPER ADMIN ONLY) */}
      {passwordTargetUser && (
        <div className="fixed inset-0 z-50 bg-[#12001f]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-[#1a0c2e] border border-amber-500/40 w-full max-w-md rounded-3xl shadow-2xl p-6 text-white space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Generate New Password</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!generatingPassword) setPasswordTargetUser(null);
                }}
                disabled={generatingPassword}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5 text-amber-300">Warning: Invalidation Notice</strong>
                Generating a new password will immediately invalidate the user's current password. A cryptographically secure temporary password valid for <strong>24 hours</strong> will be generated. The user will be required to set a new password on their next login.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Target User:</span>
                <span className="font-semibold text-white">{passwordTargetUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">User ID:</span>
                <span className="font-mono text-purple-300">@{passwordTargetUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-200">{passwordTargetUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Role:</span>
                <span className="font-bold text-[#fd8a42] uppercase">{passwordTargetUser.role || 'customer'}</span>
              </div>
            </div>

            {passwordGenError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{passwordGenError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={generatingPassword}
                onClick={() => setPasswordTargetUser(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={generatingPassword}
                onClick={handleGeneratePassword}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {generatingPassword ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    Generate Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPLAY GENERATED TEMPORARY PASSWORD MODAL (ONE-TIME DISPLAY) */}
      {generatedPasswordResult && (
        <div className="fixed inset-0 z-50 bg-[#12001f]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-[#1a0c2e] border border-emerald-500/40 w-full max-w-md rounded-3xl shadow-2xl p-6 text-white space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Temporary Password Generated</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGeneratedPasswordResult(null);
                  setPasswordCopied(false);
                }}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
              <p className="font-semibold text-amber-300 mb-1">Important: One-Time Display</p>
              <p>
                This temporary password will <strong>only be shown once</strong>. It will not be stored in plaintext. Copy it now and share it securely with the user.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 block font-medium">Generated Temporary Password:</label>
              <div className="flex items-center gap-2 bg-[#12001f] border border-white/20 rounded-xl p-3">
                <span className="font-mono text-base font-bold text-emerald-400 tracking-wider flex-1 select-all break-all">
                  {generatedPasswordResult.password}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPasswordResult.password);
                    setPasswordCopied(true);
                    setTimeout(() => setPasswordCopied(false), 3000);
                  }}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-500/30 cursor-pointer"
                >
                  {passwordCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 space-y-1 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">User:</span>
                <span className="font-medium text-white">{generatedPasswordResult.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">User ID:</span>
                <span className="font-mono text-purple-300">@{generatedPasswordResult.user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expires In:</span>
                <span className="text-amber-400 font-medium">24 Hours ({new Date(generatedPasswordResult.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Requirement:</span>
                <span className="text-purple-300 font-medium">Password change required on login</span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setGeneratedPasswordResult(null);
                  setPasswordCopied(false);
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
