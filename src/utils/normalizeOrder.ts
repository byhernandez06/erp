export const normalizeOrderForUI = (order: any) => {
    const safe = JSON.parse(JSON.stringify(order));

    safe.items = (safe.items || []).map((it: any) => {
        const cantidad = Number(it.CANT ?? it.cantidad ?? 0);

        const monto = Number(it.MONTO ?? it.montoTotal ?? 0);
        let costoUnitario = Number(it.UNITARIO ?? it.costoUnitario ?? 0);

        // ✅ Derivar unitario cuando venga en 0 y exista MONTO
        if ((!costoUnitario || costoUnitario === 0) && cantidad > 0 && monto > 0) {
            costoUnitario = +(monto / cantidad).toFixed(4);
        }

        const montoTotal =
            monto > 0
                ? monto // si MONTO viene, respetalo
                : +(cantidad * costoUnitario).toFixed(2);

        return {
            cantidad,
            unidad: it.UNIDAD ?? it.unidad ?? "",
            detalle: it.DETALLE ?? it.detalle ?? "",
            nombre: it.NOMBRE ?? it.nombre ?? "",
            cuenta: it.CUENTA ?? it.cuenta ?? safe.account ?? "",
            costoUnitario,
            montoTotal,
            // opcional: conservar originales por si algo los ocupa
            _raw: it,
        };
    });

    return safe;
};
