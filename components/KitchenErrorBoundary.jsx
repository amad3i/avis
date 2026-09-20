"use client";
import React from "react";

export default class KitchenErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Kitchen error", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="w-full h-[100dvh] flex flex-col items-center justify-center gap-4 bg-[#0E1013] text-white p-6 text-center">
          <p className="text-2xl font-black">Что-то пошло не так</p>
          <p className="text-white/50 max-w-sm">
            Панель кухни столкнулась с ошибкой. Данные заказов не потеряны — просто
            обновите страницу.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:brightness-110 transition"
          >
            Обновить страницу
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
