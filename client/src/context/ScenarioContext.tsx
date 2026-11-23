import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DemoScenario,
  User,
  AccessRequest,
  AllocationProposal,
  createSeedScenario,
  DemoScenarioSchema
} from 'shared';
import * as api from '../api/client.js';

const STORAGE_KEY = 'lablink_demo_scenario_v1';

export type DemoRole = 'student' | 'faculty' | 'admin';

interface ScenarioContextType {
  scenario: DemoScenario;
  role: DemoRole;
  currentUser: User;
  setRole: (role: DemoRole) => void;
  resetScenario: () => Promise<void>;
  submitNewRequest: (req: AccessRequest) => Promise<boolean>;
  runArbitration: (slot: { resourceId: string; date: string; startTime: string; endTime: string }) => Promise<api.ArbitrateResponse>;
  applyArbitrationProposals: (proposals: AllocationProposal[]) => Promise<boolean>;
  decideApproval: (requestId: string, decision: 'approve' | 'reject' | 'request-changes', reason: string) => Promise<boolean>;
  toastMessage: string | null;
  setToast: (msg: string | null) => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [scenario, setScenario] = useState<DemoScenario>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = DemoScenarioSchema.safeParse(JSON.parse(saved));
        if (parsed.success) {
          return parsed.data;
        }
      }
    } catch {
      // Fallback
    }
    return createSeedScenario(new Date());
  });

  const [role, setRoleState] = useState<DemoRole>('student');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync scenario changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenario));
    } catch {
      // Storage quota or disabled
    }
  }, [scenario]);

  const setToast = (msg: string | null) => {
    setToastMessage(msg);
    if (msg) {
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Derive current user based on active demo role
  const currentUser: User = React.useMemo(() => {
    if (role === 'faculty') {
      const faculty = scenario.users?.find((u) => u.role === 'faculty');
      if (faculty) return faculty;
      return {
        id: 'user_radhika',
        name: 'Dr. Radhika Iyer',
        email: 'radhika.iyer@campus.edu',
        role: 'faculty',
        departmentId: 'dept_ece',
        departmentName: 'Electronics & Communication',
        priorUsageHours: 0,
        certifications: ['SAFETY_MECH_L1', 'ESD_SAFETY_L1', 'RESIN_SAFETY_L2', 'CNC_OPERATOR_CERT']
      };
    }
    if (role === 'admin') {
      return {
        id: 'user_admin',
        name: 'Chief Lab Coordinator',
        email: 'lab.admin@campus.edu',
        role: 'admin',
        departmentId: 'dept_ece',
        departmentName: 'Central Instrumentation Facility',
        priorUsageHours: 0,
        certifications: ['SAFETY_MECH_L1', 'ESD_SAFETY_L1', 'RESIN_SAFETY_L2', 'CNC_OPERATOR_CERT']
      };
    }
    // Default student: Alex Rivera
    const student = scenario.users?.find((u) => u.id === 'user_alex');
    if (student) return student;
    return scenario.currentUser;
  }, [role, scenario]);

  const setRole = (newRole: DemoRole) => {
    setRoleState(newRole);
    setToast(`Active demo role switched to ${newRole.toUpperCase()}. Permissions updated.`);
  };

  const resetScenario = async () => {
    try {
      const fresh = await api.resetDemo();
      setScenario(fresh);
      setToast('Demo scenario successfully reset to pristine seed data.');
    } catch {
      const fresh = createSeedScenario(new Date());
      setScenario(fresh);
      setToast('Demo scenario reset locally.');
    }
  };

  const submitNewRequest = async (req: AccessRequest): Promise<boolean> => {
    try {
      const result = await api.submitRequest(req, scenario);
      if (result.success) {
        setScenario(result.updatedSnapshot);
        setToast(`Request "${req.title}" submitted successfully for faculty review.`);
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit request';
      setToast(`Error: ${msg}`);
      return false;
    }
  };

  const runArbitration = async (slot: {
    resourceId: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<api.ArbitrateResponse> => {
    return await api.arbitrateSlot({
      resourceId: slot.resourceId,
      date: slot.date,
      slot: { startTime: slot.startTime, endTime: slot.endTime },
      snapshot: scenario
    });
  };

  const applyArbitrationProposals = async (proposals: AllocationProposal[]): Promise<boolean> => {
    try {
      const result = await api.applyProposals(proposals, scenario);
      if (result.success) {
        setScenario(result.updatedSnapshot);
        setToast(`Applied ${result.appliedCount} allocation proposals. Forwarded to Faculty Approval Queue.`);
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to apply allocations';
      setToast(`Arbitration error: ${msg}`);
      return false;
    }
  };

  const decideApproval = async (
    requestId: string,
    decision: 'approve' | 'reject' | 'request-changes',
    reason: string
  ): Promise<boolean> => {
    try {
      const result = await api.submitFacultyDecision({
        requestId,
        decision,
        reason,
        snapshot: scenario
      });
      if (result.success) {
        setScenario(result.updatedSnapshot);
        setToast(`Faculty decision [${decision.toUpperCase()}] recorded.`);
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record decision';
      setToast(`Approval error: ${msg}`);
      return false;
    }
  };

  return (
    <ScenarioContext.Provider
      value={{
        scenario,
        role,
        currentUser,
        setRole,
        resetScenario,
        submitNewRequest,
        runArbitration,
        applyArbitrationProposals,
        decideApproval,
        toastMessage,
        setToast
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
}
