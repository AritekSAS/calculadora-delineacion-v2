"""Módulo para cálculo del impuesto de delineación."""


def calcular_impuesto(area, tarifa):
    """Calcula el impuesto multiplicando ``area`` por ``tarifa``.

    El resultado se redondea al peso más cercano y se devuelve como un
    entero.

    Args:
        area (float): Área sobre la cual se aplica el impuesto.
        tarifa (float): Tarifa en pesos por unidad de área.

    Returns:
        int: Valor del impuesto redondeado al peso más cercano.
    """
    impuesto = area * tarifa
    return int(round(impuesto))


if __name__ == "__main__":
    # Ejemplos de uso y pruebas básicas
    casos = [
        (100, 25.5, 2550),   # 100 * 25.5 = 2550.0
        (10.5, 200.2, 2102), # 10.5 * 200.2 = 2102.1 -> 2102
        (33.3, 20.1, 669),   # 33.3 * 20.1 = 669.33 -> 669
    ]
    for area, tarifa, esperado in casos:
        resultado = calcular_impuesto(area, tarifa)
        print(f"calcular_impuesto({area}, {tarifa}) = {resultado}")
        assert resultado == esperado, f"Esperado {esperado}, obtenido {resultado}"
    print("Pruebas básicas completadas.")