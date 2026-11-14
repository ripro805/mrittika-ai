import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { UnifiedFlowProvider } from "../context/UnifiedFlowContext";
import { AssistantChatPage } from "../pages/AssistantChatPage";
import "../i18n";

const queryClient = new QueryClient();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UnifiedFlowProvider>
          <BrowserRouter>{component}</BrowserRouter>
        </UnifiedFlowProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe("AssistantChatPage Unit & Streaming Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders assistant chat header, starter chips, and input box", () => {
    renderWithProviders(<AssistantChatPage />);

    expect(screen.getByText(/মৃত্তিকা এআই বাংলা কৃষি সহকারী/i)).toBeInTheDocument();
    expect(screen.getByText(/আমন ধানের ইউরিয়া উপরিপ্রয়োগের নিয়ম/i)).toBeInTheDocument();
    expect(screen.getByText(/আলুর নাভিধসা রোগ লক্ষণ ও প্রতিকার/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/আপনার প্রশ্নটি বাংলায় লিখুন/i)).toBeInTheDocument();
    expect(screen.getByText("0/1000")).toBeInTheDocument();
  });

  it("updates character counter as user types", () => {
    renderWithProviders(<AssistantChatPage />);

    const input = screen.getByPlaceholderText(/আপনার প্রশ্নটি বাংলায় লিখুন/i);
    fireEvent.change(input, { target: { value: "ধানের সার" } });

    expect(screen.getByText("9/1000")).toBeInTheDocument();
  });

  it("handles streaming SSE response correctly", async () => {
    // Mock SSE fetch stream
    const ssePayload = [
      'event: sources\ndata: [{"source":"BARC সার নির্দেশিকা","page":"১","snippet":"আমন ধানের সঠিক মাত্রা","is_sample":true}]\n\n',
      'event: token\ndata: {"token":"আমন ধানে "}\n\n',
      'event: token\ndata: {"token":"ইউরিয়া দিন।"}\n\n',
      'event: done\ndata: {"session_id":"test-session-123","fallback":false}\n\n',
    ].join("");

    const mockResponseStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(ssePayload));
        controller.close();
      },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: mockResponseStream,
    });

    renderWithProviders(<AssistantChatPage />);

    const input = screen.getByPlaceholderText(/আপনার প্রশ্নটি বাংলায় লিখুন/i);
    fireEvent.change(input, { target: { value: "আমন ধানের সার" } });

    const sendBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(sendBtn);

    // Verify user message appears
    expect(screen.getByText("আমন ধানের সার")).toBeInTheDocument();

    // Verify streamed tokens and sources appear
    await waitFor(() => {
      expect(screen.getByText(/আমন ধানে ইউরিয়া দিন।/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/BARC সার নির্দেশিকা/i)).toBeInTheDocument();
    expect(screen.getByText(/নমুনা নথি/i)).toBeInTheDocument();
  });

  it("renders Upazila Agriculture Officer fallback card when fallback=true", async () => {
    const sseFallbackPayload = [
      'event: sources\ndata: []\n\n',
      'event: token\ndata: {"token":"আমি নিশ্চিত নই। "}\n\n',
      'event: done\ndata: {"session_id":"fallback-123","fallback":true}\n\n',
    ].join("");

    const mockResponseStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sseFallbackPayload));
        controller.close();
      },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: mockResponseStream,
    });

    renderWithProviders(<AssistantChatPage />);

    const input = screen.getByPlaceholderText(/আপনার প্রশ্নটি বাংলায় লিখুন/i);
    fireEvent.change(input, { target: { value: "প্যারাসিটামল" } });

    const sendBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/উপজেলা কৃষি কর্মকর্তার সাথে যোগাযোগ করুন/i)).toBeInTheDocument();
    });
  });

  it("renders user message bubble and bot response when prompt chip is clicked", async () => {
    const ssePayload = [
      'event: token\ndata: {"token":"আলু চাষের পরামর্শ"}\n\n',
      'event: done\ndata: {"session_id":"chip-123","fallback":false}\n\n',
    ].join("");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(ssePayload));
          controller.close();
        },
      }),
    });

    renderWithProviders(<AssistantChatPage />);

    const chip = screen.getByText("আলুর নাভিধসা রোগ লক্ষণ ও প্রতিকার");
    fireEvent.click(chip);

    // Verify user message appears in DOM (both chip and chat bubble)
    expect(screen.getAllByText("আলুর নাভিধসা রোগ লক্ষণ ও প্রতিকার").length).toBeGreaterThanOrEqual(2);

    await waitFor(() => {
      expect(screen.getByText(/আলু চাষের পরামর্শ/i)).toBeInTheDocument();
    });
  });
});
