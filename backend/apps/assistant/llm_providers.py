"""
Backward-compatibility adapter for apps.assistant.llm_providers.
Delegates to apps.assistant.llm module.
"""

from typing import Any, Dict, List

from apps.assistant.llm.gemini import GeminiProvider
from apps.assistant.llm.mock import MockProvider
from apps.assistant.llm.router import get_llm_router

MockLLMProvider = MockProvider
GeminiLLMProvider = GeminiProvider


class LegacyLLMAdapter:
    """Adapts the router to legacy generate() interface expected by eval_rag.py."""
    def __init__(self):
        self.router = get_llm_router()

    def generate(
        self,
        user_message: str,
        context_chunks: List[Dict[str, Any]],
        context_metadata: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        from apps.assistant.rag_engine import build_assistant_messages
        messages = build_assistant_messages(
            user_message=user_message,
            context_chunks=context_chunks,
            client_context=context_metadata,
        )
        return self.router.generate(messages, stream=False, context_chunks=context_chunks)


def get_llm_provider():
    return LegacyLLMAdapter()
