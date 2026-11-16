import base64
import json
import os
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import (
    binary_dilation,
    distance_transform_edt,
    gaussian_filter,
    map_coordinates,
)

SRC_IMAGE = (
    "C:/Users/bowhe/.gemini/antigravity/brain/"
    "84f671d8-eb56-4556-bd91-00cf2227845e/.user_uploaded/media_1794722347432_e84c6cc1.jpg"
)
OUT_DIR = "C:/Users/bowhe/.gemini/antigravity/scratch/cosmic-study-motion/assets"
HG_DIR = "C:/Users/bowhe/.gemini/antigravity/scratch/cosmic-study-motion/hourglass_project"
SCRATCH_DIR = (
    "C:/Users/bowhe/.gemini/antigravity/brain/"
    "84f671d8-eb56-4556-bd91-00cf2227845e/scratch"
)

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(os.path.join(OUT_DIR, "books"), exist_ok=True)
os.makedirs(SCRATCH_DIR, exist_ok=True)

# 38 pixel-aligned vertical shelf books across all 4 bookcase bays (all real books by real authors!)
BOOKS = [
    # --- Bay 1, Row 2 ---
    {
        "id": 0, "key": "omar_khayyam",
        "x1": 118, "y1": 57, "x2": 150, "y2": 143,
        "title": "Рубаи", "author": "Омар Хайям (XI–XII вв.)", "category": "Поэзия и философия",
        "note": "Бессмертные четверостишия персидского поэта, математика и астронома о быстротечности времени, звёздном небе и мудрости жизни.",
        "effect": "dust_swirl", "effect_label": "Золотой вихрь",
    },
    {
        "id": 1, "key": "lucretius",
        "x1": 36, "y1": 56, "x2": 49, "y2": 143,
        "title": "О природе вещей", "author": "Тит Лукреций Кар (I в. до н. э.)", "category": "Античная философия",
        "note": "Философская поэма об атомах, пустоте, движении светил и законах материального мира.",
        "effect": "none", "effect_label": "",
    },
    {
        "id": 2, "key": "marcus_aurelius",
        "x1": 51, "y1": 60, "x2": 66, "y2": 143,
        "title": "Наедине с собой", "author": "Марк Аврелий (II в.)", "category": "Стоицизм",
        "note": "Личные размышления римского императора о внутреннем покое, долге и течении человеческих столетий.",
        "effect": "none", "effect_label": "",
    },
    {
        "id": 3, "key": "kepler_harmonia",
        "x1": 230, "y1": 54, "x2": 241, "y2": 143,
        "title": "Гармония мира", "author": "Иоганн Кеплер (1619)", "category": "Астрономия",
        "note": "Труд, в котором сформулирован третий закон движения планет и идея небесной музыкальной гармонии.",
        "effect": "sync_planets", "effect_label": "Резонанс сфер",
    },
    {
        "id": 4, "key": "copernicus",
        "x1": 248, "y1": 57, "x2": 257, "y2": 143,
        "title": "О вращении небесных сфер", "author": "Николай Коперник (1543)", "category": "Астрономия",
        "note": "Эпохальное сочинение, поставившее Солнце в центр планетной системы.",
        "effect": "sync_planets", "effect_label": "Гармония орбит",
    },

    # --- Bay 2, Row 2 ---
    {
        "id": 5, "key": "bruno_worlds",
        "x1": 353, "y1": 62, "x2": 365, "y2": 142,
        "title": "О бесконечности, Вселенной и мирах", "author": "Джордано Бруно (1584)", "category": "Космология",
        "note": "Диалоги о бесчисленности обитаемых миров и бесконечности пространства.",
        "effect": "none", "effect_label": "",
    },
    {
        "id": 6, "key": "galileo_messenger",
        "x1": 375, "y1": 55, "x2": 387, "y2": 142,
        "title": "Звёздный вестник", "author": "Галилео Галилей (1610)", "category": "Наблюдения",
        "note": "Первые телескопические зарисовки гор Луны, Млечного Пути и четырёх спутников Юпитера.",
        "effect": "sync_planets", "effect_label": "Орбитальный строй",
    },
    {
        "id": 7, "key": "lomonosov_venus",
        "x1": 401, "y1": 59, "x2": 413, "y2": 142,
        "title": "Явление Венеры на Солнце", "author": "Михаил Ломоносов (1761)", "category": "Астрофизика",
        "note": "Исторический доклад об открытии плотной атмосферы у планеты Венера при прохождении её по диску Солнца.",
        "effect": "lamp_pulse", "effect_label": "Свет Венеры",
    },
    {
        "id": 8, "key": "laplace_mechanics",
        "x1": 414, "y1": 59, "x2": 428, "y2": 142,
        "title": "Трактат о небесной механике", "author": "Пьер-Симон Лаплас (1799)", "category": "Математика",
        "note": "Фундаментальное аналитическое исследование устойчивости орбит планет Солнечной системы.",
        "effect": "sync_planets", "effect_label": "Резонанс сфер",
    },
    {
        "id": 9, "key": "dante_comedy",
        "x1": 430, "y1": 60, "x2": 446, "y2": 142,
        "title": "Божественная комедия", "author": "Данте Алигьери (1321)", "category": "Классика",
        "note": "Поэма, возносящая читателя сквозь девять небесных сфер — от Луны и Венеры до Перводвигателя.",
        "effect": "none", "effect_label": "",
    },

    # --- Bay 3, Row 2 ---
    {
        "id": 10, "key": "newton_principia",
        "x1": 575, "y1": 49, "x2": 586, "y2": 138,
        "title": "Математические начала натуральной философии", "author": "Исаак Ньютон (1687)", "category": "Физика",
        "note": "Труд, объединивший земную механику и движение планет единым законом всемирного тяготения.",
        "effect": "reverse_pulse", "effect_label": "Импульс гравитации",
    },
    {
        "id": 11, "key": "einstein_relativity",
        "x1": 598, "y1": 52, "x2": 610, "y2": 138,
        "title": "О специальной и общей теории относительности", "author": "Альберт Эйнштейн (1917)", "category": "Физика",
        "note": "Общедоступное изложение связи пространства, времени и тяготения.",
        "effect": "sand_boost", "effect_label": "Искривление времени",
    },
    {
        "id": 12, "key": "hawking_time",
        "x1": 623, "y1": 52, "x2": 632, "y2": 138,
        "title": "Краткая история времени", "author": "Стивен Хокинг (1988)", "category": "Космология",
        "note": "Рассказ о происхождении Вселенной, чёрных дырах и трёх стрелах времени.",
        "effect": "sand_boost", "effect_label": "Поток времени",
    },
    {
        "id": 13, "key": "huygens_light",
        "x1": 674, "y1": 58, "x2": 687, "y2": 138,
        "title": "Трактат о свете", "author": "Христиан Гюйгенс (1690)", "category": "Оптика",
        "note": "Волновая теория света и исследования создателя первых маятниковых часов.",
        "effect": "lamp_pulse", "effect_label": "Сияние лампы",
    },
    {
        "id": 14, "key": "kozyrev_time",
        "x1": 695, "y1": 58, "x2": 714, "y2": 138,
        "title": "Причинная или несимметричная механика", "author": "Николай Козырев (1958)", "category": "Хронометрия",
        "note": "Оригинальная теория физических свойств времени и его связи с вращением небесных тел.",
        "effect": "sand_boost", "effect_label": "Ускорение песка",
    },

    # --- Bay 4, Row 2 ---
    {
        "id": 15, "key": "tsiolkovsky_dreams",
        "x1": 786, "y1": 56, "x2": 795, "y2": 142,
        "title": "Грёзы о Земле и небе", "author": "Константин Циолковский (1895)", "category": "Космонавтика",
        "note": "Научно-философские очерки о невесомости, искусственных спутниках и жизни в космосе.",
        "effect": "none", "effect_label": "",
    },
    {
        "id": 16, "key": "ptolemy_almagest",
        "x1": 814, "y1": 53, "x2": 827, "y2": 142,
        "title": "Альмагест", "author": "Клавдий Птолемей (II в.)", "category": "Античная астрономия",
        "note": "Великий звёздный каталог и геометрическая модель движения Солнца, Луны и пяти известных в древности планет.",
        "effect": "sync_planets", "effect_label": "Строй светил",
    },
    {
        "id": 17, "key": "flammarion",
        "x1": 839, "y1": 53, "x2": 855, "y2": 142,
        "title": "Популярная астрономия", "author": "Камиль Фламмарион (1880)", "category": "Астрономия",
        "note": "Поэтическое и богато иллюстрированное описание Марса, Венеры, Юпитера и далёких звёзд.",
        "effect": "sync_planets", "effect_label": "Гармония орбит",
    },
    {
        "id": 18, "key": "wells_time_machine",
        "x1": 865, "y1": 53, "x2": 882, "y2": 142,
        "title": "Машина времени", "author": "Герберт Уэллс (1895)", "category": "Научная фантастика",
        "note": "Классический роман о путешествии сквозь эпохи и наблюдении за угасанием далёких солнц.",
        "effect": "sand_boost", "effect_label": "Ход времени",
    },
    {
        "id": 19, "key": "sagan_cosmos",
        "x1": 892, "y1": 52, "x2": 914, "y2": 142,
        "title": "Космос", "author": "Карл Саган (1980)", "category": "Планетология",
        "note": "Увлекательное путешествие по планетам и галактикам от Александрийской библиотеки до границ Вселенной.",
        "effect": "sync_planets", "effect_label": "Резонанс сфер",
    },
    {
        "id": 20, "key": "faust_goethe",
        "x1": 914, "y1": 55, "x2": 926, "y2": 142,
        "title": "Фауст", "author": "Иоганн Вольфганг фон Гёте (1808)", "category": "Драма",
        "note": "Трагедия об учёном, стремившемся познать тайны мироздания и остановить прекрасное мгновение.",
        "effect": "secret_chime", "effect_label": "Магия кабинета",
    },
    {
        "id": 21, "key": "tolstoy_war_peace",
        "x1": 968, "y1": 54, "x2": 979, "y2": 142,
        "title": "Война и мир", "author": "Лев Толстой (1869)", "category": "Роман-эпопея",
        "note": "Великое произведение о судьбах, истории и «высоком бесконечном небе» над человеком.",
        "effect": "none", "effect_label": "",
    },

    # --- Bay 1, Row 3 ---
    {
        "id": 22, "key": "seneca_letters",
        "x1": 81, "y1": 169, "x2": 95, "y2": 258,
        "title": "Нравственные письма к Луцилию", "author": "Луций Анней Сенека (I в.)", "category": "Философия",
        "note": "Письма о цене каждого часа: «Мы не получаем короткую жизнь, мы сами делаем её такою».",
        "effect": "none", "effect_label": "",
    },
    {
        "id": 23, "key": "verne_moon",
        "x1": 110, "y1": 169, "x2": 124, "y2": 258,
        "title": "С Земли на Луну", "author": "Жюль Верн (1865)", "category": "Приключения",
        "note": "Инженерно выверенный роман о первом полёте снаряда за пределы земного притяжения.",
        "effect": "none", "effect_label": "",
    },
    {
        "id": 24, "key": "borges_library",
        "x1": 126, "y1": 169, "x2": 139, "y2": 258,
        "title": "Вавилонская библиотека", "author": "Хорхе Луис Борхес (1941)", "category": "Проза",
        "note": "Философская притча о бесконечной Вселенной, устроенной как шестигранные книжные галереи.",
        "effect": "secret_chime", "effect_label": "Тайный каталог",
    },
    {
        "id": 25, "key": "exupery_prince",
        "x1": 147, "y1": 169, "x2": 161, "y2": 258,
        "title": "Маленький принц", "author": "Антуан де Сент-Экзюпери (1943)", "category": "Сказка-притча",
        "note": "Поэтическая история о путешествиях между крошечными планетами и ответственности за свой мир.",
        "effect": "dust_swirl", "effect_label": "Звёздная пыль",
    },
    {
        "id": 26, "key": "dostoevsky_karamazov",
        "x1": 192, "y1": 169, "x2": 208, "y2": 258,
        "title": "Братья Карамазовы", "author": "Фёдор Достоевский (1880)", "category": "Литература",
        "note": "Философский роман о смысле бытия, свободе выбора и человеческой совести.",
        "effect": "none", "effect_label": "",
    },
    {
        "id": 27, "key": "bulgakov_master",
        "x1": 209, "y1": 169, "x2": 220, "y2": 258,
        "title": "Мастер и Маргарита", "author": "Михаил Булгаков (1940)", "category": "Роман",
        "note": "Знаменитый роман о силе искусства, вечности и о том, что «рукописи не горят».",
        "effect": "lamp_pulse", "effect_label": "Искра лампы",
    },
    {
        "id": 28, "key": "pushkin_onegin",
        "x1": 255, "y1": 165, "x2": 268, "y2": 258,
        "title": "Евгений Онегин", "author": "Александр Пушкин (1833)", "category": "Поэзия",
        "note": "Энциклопедия русской жизни в строфах, украшенная золотым обрезом.",
        "effect": "none", "effect_label": "",
    },

    # --- Bay 2 & 3, Row 3 ---
    {
        "id": 29, "key": "lem_solaris",
        "x1": 361, "y1": 168, "x2": 376, "y2": 257,
        "title": "Солярис", "author": "Станислав Лем (1961)", "category": "Фантастика",
        "note": "Классический роман о далёкой планете, покрытой мыслящим океаном, и пределах человеческого познания.",
        "effect": "dust_swirl", "effect_label": "Шлейф океана",
    },
    {
        "id": 30, "key": "descartes_method",
        "x1": 614, "y1": 165, "x2": 625, "y2": 252,
        "title": "Рассуждение о методе", "author": "Рене Декарт (1637)", "category": "Философия",
        "note": "Основополагающий труд о ясном рациональном познании, оптике и координатах пространства.",
        "effect": "lamp_pulse", "effect_label": "Ясный свет",
    },

    # --- Bay 4, Row 3 ---
    {
        "id": 31, "key": "avicenna_canon",
        "x1": 821, "y1": 177, "x2": 835, "y2": 258,
        "title": "Канон врачебной науки", "author": "Абу Али ибн Сина (Авиценна, XI в.)", "category": "Медицина",
        "note": "Энциклопедия средневековой медицины, анатомии и естествознания.",
        "effect": "none", "effect_label": "",
    },
    {
        "id": 32, "key": "vesalius_fabrica",
        "x1": 835, "y1": 168, "x2": 853, "y2": 258,
        "title": "О строении человеческого тела", "author": "Андреас Везалий (1543)", "category": "Анатомия",
        "note": "Революционный ренессансный атлас, положивший начало научной анатомии.",
        "effect": "none", "effect_label": "",
    },
    {
        "id": 33, "key": "leonardo_notebooks",
        "x1": 876, "y1": 168, "x2": 895, "y2": 258,
        "title": "Записные книжки", "author": "Леонардо да Винчи (XV–XVI вв.)", "category": "Искусство и наука",
        "note": "Том с миниатюрным портретом мастера на корешке: заметки об оптике, анатомии, крыльях и небесных телах.",
        "effect": "secret_chime", "effect_label": "Тайный механизм",
    },
    {
        "id": 34, "key": "shakespeare_sonnets",
        "x1": 895, "y1": 168, "x2": 915, "y2": 258,
        "title": "Сонеты", "author": "Уильям Шекспир (1609)", "category": "Поэзия",
        "note": "Классический цикл сонетов о красоте, вечности и споре поэзии со временем.",
        "effect": "none", "effect_label": "",
    },
    {
        "id": 35, "key": "tesla_inventions",
        "x1": 915, "y1": 168, "x2": 934, "y2": 258,
        "title": "Мои изобретения", "author": "Никола Тесла (1919)", "category": "Автобиография",
        "note": "Воспоминания великого инженера о резонансе, вращающемся магнитном поле и энергии света.",
        "effect": "lamp_pulse", "effect_label": "Резонанс тока",
    },
    {
        "id": 36, "key": "bradbury_chronicles",
        "x1": 935, "y1": 172, "x2": 948, "y2": 258,
        "title": "Марсианские хроники", "author": "Рэй Брэдбери (1950)", "category": "Фантастика",
        "note": "Лирические новеллы о красных песках Марса, тихих каналах и человеческой памяти.",
        "effect": "reverse_pulse", "effect_label": "Отзвук Марса",
    },
    {
        "id": 37, "key": "harvey_circulation",
        "x1": 863, "y1": 168, "x2": 875, "y2": 258,
        "title": "Анатомическое исследование о движении сердца", "author": "Уильям Гарвей (1628)", "category": "Анатомия",
        "note": "Труд в зелёном переплёте, впервые доказавший замкнутое кровообращение в теле человека.",
        "effect": "none", "effect_label": "",
    },
]

# Desk Book lying on left side of the desk: "Атлас анатомии человека"
DESK_BOOK = {
    "id": "desk",
    "key": "sinelnikov_anatomy",
    "x1": 14, "y1": 578, "x2": 192, "y2": 658,
    "poly": [(95, 580), (183, 580), (189, 588), (186, 601), (128, 655), (16, 654), (16, 622), (80, 586)],
    "title": "Атлас анатомии человека",
    "author": "Р. Д. Синельников",
    "category": "Анатомия · На столе",
    "note": "Классический фундаментальный атлас в твёрдом коричневом переплёте с подробными гравюрами строения человеческого тела.",
    "effect": "open_atlas",
    "effect_label": "Интерактивный атлас",
}

PLANETS = [
    {
        "id": 0, "key": "mars", "name": "Марс · Алый Глобус",
        "subtitle": "Красная планета с каньонами в бронзовом меридиане",
        "cx": 153.0, "cy": 325.0, "r": 50.0, "tilt": -23.0, "speed": 0.28,
        "glow": "#e86432",
    },
    {
        "id": 1, "key": "jupiter", "name": "Юпитер · Вихревой Гигант",
        "subtitle": "Полосатая атмосфера из кремово-охристых облачных поясов",
        "cx": 296.0, "cy": 324.0, "r": 49.0, "tilt": -23.0, "speed": 0.44,
        "glow": "#f3c778",
    },
    {
        "id": 2, "key": "venus", "name": "Венера · Утренняя Звезда",
        "subtitle": "Плотный покров сернистых облаков и ретроградное вращение",
        "cx": 754.5, "cy": 327.5, "r": 45.0, "tilt": 23.4, "speed": -0.20,
        "glow": "#f5d48e",
    },
    {
        "id": 3, "key": "titan", "name": "Титан · Янтарный Мир",
        "subtitle": "Золотистая атмосфера крупнейшего спутника Сатурна",
        "cx": 884.0, "cy": 328.5, "r": 44.5, "tilt": 23.5, "speed": 0.24,
        "glow": "#e8a245",
    },
]


def fbm_noise(h, w, seed=42):
    rng = np.random.default_rng(seed)
    out = np.zeros((h, w), dtype=np.float32)
    for octv, amp in [(4, 0.50), (8, 0.28), (16, 0.14), (32, 0.08)]:
        grid = rng.uniform(-1, 1, size=(octv, octv * 2)).astype(np.float32)
        grid_pad = np.hstack([grid[:, -2:], grid, grid[:, :2]])
        ys = np.linspace(0, octv - 1, h)
        xs = np.linspace(2, octv * 2 + 1.999, w)
        yy, xx = np.meshgrid(ys, xs, indexing="ij")
        out += amp * map_coordinates(grid_pad, [yy, xx], order=1, mode="nearest")
    return out


def synthesize_venus_texture(W=256, H=128):
    """
    Create a painterly comic-illustrated Venus equirectangular texture:
    creamy-champagne, warm butter-gold, and sulfuric ochre V-chevron cloud swirls
    matching the graphic-novel palette under the desk lamp!
    """
    lons = np.linspace(-np.pi, np.pi, W, endpoint=False)
    lats = np.linspace(np.pi / 2, -np.pi / 2, H)
    LON, LAT = np.meshgrid(lons, lats)

    n1 = fbm_noise(H, W, seed=401)
    n2 = fbm_noise(H, W, seed=409)
    n3 = fbm_noise(H, W, seed=419)

    # Characteristic Venus V-shaped equatorial chevron cloud shear + zonal bands
    chevron_phase = 2.6 * np.cos(LAT * 1.4) + 0.85 * np.sin(LON + 1.2 * np.abs(LAT))
    band_coord = LAT * 5.2 + 0.55 * np.sin(LON * 1.0 + 2.4 * np.abs(LAT)) + 0.9 * n1 + 0.4 * n2
    bands = 0.5 + 0.5 * np.sin(band_coord + 0.45 * np.sin(chevron_phase))

    # Smooth polar brightening (Venus polar hoods are brighter pearl-cream!)
    polar = np.clip((np.abs(LAT) - 0.85) / 0.65, 0.0, 1.0)
    swirl = np.clip(bands * 0.68 + (0.5 + 0.5 * n2) * 0.24 + (0.5 + 0.5 * n3) * 0.14, 0.0, 1.0)
    swirl = swirl * (1.0 - polar * 0.35) + polar * 0.88

    # Rich comic-painted sulfuric cream-amber palette
    c_deep = np.array([174.0, 124.0, 74.0])    # warm amber-ochre cloud trough
    c_mid  = np.array([222.0, 184.0, 128.0])   # sulfuric golden cream
    c_high = np.array([248.0, 232.0, 194.0])   # sunlit ivory-pearl upper deck

    tex = np.zeros((H, W, 3), dtype=np.float32)
    low_t = np.clip(swirl / 0.55, 0.0, 1.0)
    high_t = np.clip((swirl - 0.45) / 0.55, 0.0, 1.0)

    mid_mix = c_deep[None, None, :] * (1.0 - low_t[..., None]) + c_mid[None, None, :] * low_t[..., None]
    tex = mid_mix * (1.0 - high_t[..., None]) + c_high[None, None, :] * high_t[..., None]

    # Subtle comic-ink wispy atmospheric contour strokes along mid-latitudes
    streak_mask = (np.abs(np.sin(band_coord * 1.8 + n2 * 2.2)) < 0.075) & (np.abs(LAT) < 1.15)
    streak_alpha = gaussian_filter(streak_mask.astype(np.float32), sigma=0.55)
    ink_tint = np.array([112.0, 76.0, 46.0])
    tex = tex * (1.0 - 0.34 * streak_alpha[..., None]) + ink_tint[None, None, :] * (0.34 * streak_alpha[..., None])

    return gaussian_filter(tex, sigma=(0.45, 0.6, 0))


def extract_planet_assets(arr, p):
    cx, cy, r, tilt_deg = p["cx"], p["cy"], p["r"], p["tilt"]
    sz = int(np.ceil(r * 2 + 12))
    half = sz // 2
    ys, xs = np.mgrid[0:sz, 0:sz]
    sx = (xs - half) / r
    sy = -(ys - half) / r
    rad = np.sqrt(sx * sx + sy * sy)

    ix = cx + (xs - half)
    iy = cy + (ys - half)
    patch = np.stack(
        [map_coordinates(arr[:, :, c], [iy, ix], order=1, mode="nearest") for c in range(3)],
        axis=-1,
    )

    scale83 = np.where(rad > 0.83, 0.83 / np.maximum(rad, 1e-6), 1.0)
    patch_clamped = np.stack(
        [
            map_coordinates(
                patch[:, :, c],
                [half + (ys - half) * scale83, half + (xs - half) * scale83],
                order=1,
                mode="nearest",
            )
            for c in range(3)
        ],
        axis=-1,
    )
    lum_clamped = (
        0.299 * patch_clamped[:, :, 0]
        + 0.587 * patch_clamped[:, :, 1]
        + 0.114 * patch_clamped[:, :, 2]
    )
    clean_mask = rad <= 0.83
    mean_lum = float(np.mean(lum_clamped[clean_mask]))

    smooth_lum = gaussian_filter(lum_clamped, sigma=r * 0.25)
    light_field = np.clip(smooth_lum / max(mean_lum, 1.0), 0.46, 1.55)
    albedo = np.clip(patch_clamped / light_field[..., None], 0, 255)

    scale94 = np.where(rad > 0.94, 0.94 / np.maximum(rad, 1e-6), 1.0)
    patch_94 = np.stack(
        [
            map_coordinates(
                patch[:, :, c],
                [half + (ys - half) * scale94, half + (xs - half) * scale94],
                order=1,
                mode="nearest",
            )
            for c in range(3)
        ],
        axis=-1,
    )
    lum94 = 0.299 * patch_94[:, :, 0] + 0.587 * patch_94[:, :, 1] + 0.114 * patch_94[:, :, 2]
    light_runtime = np.clip(gaussian_filter(lum94, sigma=r * 0.18) / max(mean_lum, 1.0), 0.34, 1.62)

    W, H = 256, 128

    if p["key"] == "venus":
        tex = synthesize_venus_texture(W, H)
    else:
        tilt = np.deg2rad(tilt_deg)
        lons = np.linspace(-np.pi, np.pi, W, endpoint=False)
        lats = np.linspace(np.pi / 2, -np.pi / 2, H)
        LON, LAT = np.meshgrid(lons, lats)

        def sample_front(lon_arr, lat_arr, clean_patch=albedo):
            lx = np.cos(lat_arr) * np.sin(lon_arr)
            ly = np.sin(lat_arr)
            sx_s = lx * np.cos(tilt) + ly * np.sin(tilt)
            sy_s = -lx * np.sin(tilt) + ly * np.cos(tilt)
            px = half + sx_s * r
            py = half - sy_s * r
            return np.stack(
                [map_coordinates(clean_patch[:, :, c], [py, px], order=1, mode="nearest") for c in range(3)],
                axis=-1,
            )

        def wrap_angle(a):
            return (a + np.pi) % (2 * np.pi) - np.pi

        albedo_back = albedo.copy()
        if p["key"] == "mars":
            bg_col = np.median(albedo[half - 34 : half - 26, half - 20 : half + 15], axis=(0, 1))
            yy, xx = np.mgrid[0:sz, 0:sz]
            mask_txt = (xx > half + 2) & (xx < half + 38) & (yy > half - 28) & (yy < half - 8)
            dist_txt = gaussian_filter(mask_txt.astype(np.float32), sigma=2.5)
            albedo_back = albedo_back * (1.0 - dist_txt[..., None]) + bg_col[None, None, :] * dist_txt[..., None]

        if p["key"] == "jupiter":
            centers = [0.0, np.pi / 2, np.pi, -np.pi / 2]
            signs = [1.0, -1.0, 1.0, -1.0]
            lshifts = [0.0, 0.06, -0.06, 0.04]
            span = np.deg2rad(48.0)
            core = np.deg2rad(34.0)
        else:
            centers = [0.0, np.pi / 2, np.pi, -np.pi / 2]
            signs = [1.0, -1.0, 1.0, -1.0]
            lshifts = [0.0, 0.14, -0.18, 0.14]
            span = np.deg2rad(48.0)
            core = np.deg2rad(32.0)

        acc = np.zeros((H, W, 3), dtype=np.float32)
        wsum = np.zeros((H, W), dtype=np.float32)
        n_warp = fbm_noise(H, W, seed=80 + p["id"])
        for idx_c, (c, sgn, lsh) in enumerate(zip(centers, signs, lshifts)):
            d = wrap_angle(LON - c)
            mask = np.abs(d) < span
            t = np.clip((np.abs(d) - core) / (span - core), 0.0, 1.0)
            w = np.where(mask, 0.5 * (1.0 + np.cos(np.pi * t)), 0.0)
            if idx_c == 0:
                lon_s = np.clip(d, -np.deg2rad(44.0), np.deg2rad(44.0))
                lat_s = LAT
                src_p = albedo
            else:
                lon_s = np.clip(d * sgn * 0.78, -np.deg2rad(35.0), np.deg2rad(35.0))
                flip = -1.0 if (idx_c == 2 and p["key"] != "jupiter") else 1.0
                lat_s = np.clip(LAT * flip + lsh + 0.06 * n_warp, -np.pi / 2, np.pi / 2)
                src_p = albedo_back
            samp = sample_front(lon_s, lat_s, src_p)
            acc += samp * w[..., None]
            wsum += w
        tex = acc / np.maximum(wsum[..., None], 1e-5)

    tex_img = Image.fromarray(np.clip(tex, 0, 255).astype(np.uint8))
    tex_img.save(os.path.join(OUT_DIR, f"planet_{p['id']}_tex.png"))

    light_u8 = np.clip((light_runtime / 2.0) * 255.0, 0, 255).astype(np.uint8)
    light_img = Image.fromarray(light_u8, mode="L").resize((128, 128), Image.BILINEAR)
    light_img.save(os.path.join(OUT_DIR, f"planet_{p['id']}_light.png"))


def paint_shelf_cavity(bg_arr, b):
    x1, y1, x2, y2 = b["x1"], b["y1"], b["x2"], b["y2"]
    h = y2 - y1
    w = x2 - x1
    yy, xx = np.mgrid[0:h, 0:w]
    nx = (xx + 0.5) / max(w, 1)
    ny = (yy + 0.5) / max(h, 1)
    base = np.zeros((h, w, 3), dtype=np.float32)
    base[:, :, 0] = 22.0 + 18.0 * (ny ** 1.6)
    base[:, :, 1] = 14.0 + 11.0 * (ny ** 1.6)
    base[:, :, 2] = 9.0 + 7.0 * (ny ** 1.6)
    edge_shadow = np.minimum(np.minimum(nx, 1.0 - nx) * 4.5, 1.0) * np.minimum(ny * 4.0, 1.0)
    base *= (0.42 + 0.58 * edge_shadow)[..., None]
    if x1 > 650:
        base[:, :, 0] += 14.0 * (ny ** 1.3)
        base[:, :, 1] += 8.0 * (ny ** 1.3)
    base[:, 0, :] *= 0.45
    base[:, -1, :] *= 0.45
    base[0, :, :] *= 0.5
    bg_arr[y1:y2, x1:x2] = np.clip(base, 0, 255)


def extract_desk_book(arr, bg_arr):
    """Extract the brown book lying on the left side of the desk and fill smooth leather under it."""
    H, W = arr.shape[:2]
    poly_img = Image.new("L", (W, H), 0)
    ImageDraw.Draw(poly_img).polygon(DESK_BOOK["poly"], fill=255)
    mask = np.array(poly_img, dtype=np.float32) > 127

    alpha = gaussian_filter(mask.astype(np.float32), sigma=0.7)
    alpha = np.clip((alpha - 0.12) / 0.78, 0.0, 1.0)

    x1, y1, x2, y2 = DESK_BOOK["x1"], DESK_BOOK["y1"], DESK_BOOK["x2"], DESK_BOOK["y2"]
    cw = x2 - x1
    ch = y2 - y1
    crop_rgba = np.zeros((ch, cw, 4), dtype=np.uint8)
    crop_rgba[:, :, :3] = np.clip(arr[y1:y2, x1:x2], 0, 255).astype(np.uint8)
    crop_rgba[:, :, 3] = np.clip(alpha[y1:y2, x1:x2] * 255.0, 0, 255).astype(np.uint8)
    Image.fromarray(crop_rgba, mode="RGBA").save(os.path.join(OUT_DIR, "desk_book.png"))

    # Fill desk surface cleanly underneath the desk book using clean right/left desk rows!
    dil = binary_dilation(mask, iterations=4)
    for y in range(y1 - 2, y2 + 4):
        row_m = dil[y]
        if not np.any(row_m):
            continue
        # Sample clean leather color from x=196..210 on the same row (right between book & wallet!)
        ref_col = np.median(arr[y, 195:208], axis=0)
        bg_arr[y, row_m] = ref_col


def extract_gentleman_layers(arr):
    H, W = arr.shape[:2]
    man_poly = [
        (524, 136), (554, 143), (573, 162), (583, 186), (585, 206),
        (591, 214), (591, 229), (587, 248), (582, 265), (575, 281),
        (580, 294), (620, 314), (668, 338), (696, 353), (712, 376),
        (736, 424), (759, 474), (779, 522), (784, 548), (780, 560),
        (740, 574), (698, 562), (618, 561), (520, 561), (428, 561),
        (344, 562), (302, 574), (255, 560),
        (254, 540), (268, 504), (294, 456), (320, 406), (344, 365),
        (362, 344), (406, 322), (446, 300), (469, 284),
        (465, 266), (460, 245), (458, 220), (461, 204), (462, 184),
        (472, 159), (496, 142),
    ]

    poly_img = Image.new("L", (W, H), 0)
    ImageDraw.Draw(poly_img).polygon(man_poly, fill=255)
    mask = np.array(poly_img, dtype=np.float32) > 127

    alpha = gaussian_filter(mask.astype(np.float32), sigma=0.85)
    alpha = np.clip((alpha - 0.12) / 0.78, 0.0, 1.0)
    yy, _ = np.mgrid[0:H, 0:W]
    desk_fade = np.clip((566.0 - yy) / 14.0, 0.0, 1.0)
    alpha = np.where(yy >= 550, alpha * desk_fade, alpha)

    fg_rgba = np.zeros((H, W, 4), dtype=np.uint8)
    fg_rgba[:, :, :3] = np.clip(arr, 0, 255).astype(np.uint8)
    fg_rgba[:, :, 3] = np.clip(alpha * 255.0, 0, 255).astype(np.uint8)
    Image.fromarray(fg_rgba, mode="RGBA").save(os.path.join(OUT_DIR, "gentleman_fg.png"))
    return mask


def inpaint_subtle_margin(bg_arr, mask):
    inner_zone = binary_dilation(mask, iterations=2)
    out = bg_arr.copy()
    _, indices = distance_transform_edt(inner_zone, return_indices=True)
    for c in range(3):
        nearest_vals = bg_arr[indices[0], indices[1], c]
        out[inner_zone, c] = nearest_vals[inner_zone]
    return out


def test_render_venus_strip():
    """Render 4 spin angles of Venus with the exact lamp shading map for inspection."""
    p = PLANETS[2]
    tex = np.array(Image.open(os.path.join(OUT_DIR, "planet_2_tex.png")), dtype=np.float32)
    light = np.array(Image.open(os.path.join(OUT_DIR, "planet_2_light.png")), dtype=np.float32) / 127.5
    W_t, H_t = tex.shape[1], tex.shape[0]
    r = p["r"]
    tilt = np.deg2rad(p["tilt"])
    sz = 110
    half = sz // 2
    ys, xs = np.mgrid[0:sz, 0:sz]
    sx = (xs - half) / r
    sy = -(ys - half) / r
    rad2 = sx * sx + sy * sy
    inside = rad2 <= 1.0
    sz_z = np.sqrt(np.maximum(0.0, 1.0 - rad2))
    lx = sx * np.cos(tilt) - sy * np.sin(tilt)
    ly = sx * np.sin(tilt) + sy * np.cos(tilt)
    lz = sz_z
    lat = np.arcsin(np.clip(ly, -1.0, 1.0))
    lon0 = np.arctan2(lx, lz)
    lsz = light.shape[0]
    lu = np.clip((sx * 0.5 + 0.5) * (lsz - 1), 0, lsz - 1)
    lv = np.clip((-sy * 0.5 + 0.5) * (lsz - 1), 0, lsz - 1)
    l_val = map_coordinates(light, [lv, lu], order=1, mode="nearest")

    strip = Image.new("RGB", (4 * sz, sz), (24, 15, 10))
    for col_i, deg in enumerate([0, 90, 180, 270]):
        lon = (lon0 + np.deg2rad(deg) + np.pi) % (2 * np.pi) - np.pi
        u = ((lon + np.pi) / (2 * np.pi)) * W_t
        v = (0.5 - lat / np.pi) * (H_t - 1)
        rgb = np.stack([map_coordinates(tex[:, :, c], [v, u], order=1, mode="wrap") for c in range(3)], axis=-1)
        shaded = np.clip(rgb * l_val[..., None], 0, 255)
        out = np.full((sz, sz, 3), 24.0, dtype=np.float32)
        out[inside] = shaded[inside]
        strip.paste(Image.fromarray(out.astype(np.uint8)), (col_i * sz, 0))
    strip.save(os.path.join(SCRATCH_DIR, "check_venus_spin.png"))


def build_custom_hourglass_assets():
    """Prepare the user's baroque gimbal hourglass layers & crisp glass shell overlay."""
    back = Image.open(os.path.join(HG_DIR, "hourglass_back_layer.png")).convert("RGBA")
    front = Image.open(os.path.join(HG_DIR, "hourglass_front_overlay.png")).convert("RGBA")
    mask = Image.open(os.path.join(HG_DIR, "hourglass_glass_mask_crop.png")).convert("RGBA")

    # Downscale to 531x828 (front/back) and 253x526 (mask/glass) — ~3x crisp retina vs desk size
    back_s = back.resize((531, 828), Image.LANCZOS)
    front_s = front.resize((531, 828), Image.LANCZOS)
    mask_s = mask.resize((253, 526), Image.LANCZOS)

    back_s.save(os.path.join(OUT_DIR, "hg_back.png"))
    front_s.save(os.path.join(OUT_DIR, "hg_front.png"))
    mask_s.save(os.path.join(OUT_DIR, "hg_mask.png"))

    # Synthesize crisp frosted glass shell + ink contour + reflection streaks matching Image 2 (2).png
    m_arr = np.array(mask, dtype=np.float32)
    alpha_bin = m_arr[:, :, 3] > 128
    dist = distance_transform_edt(alpha_bin)
    H_m, W_m = dist.shape
    yy, xx = np.mgrid[0:H_m, 0:W_m]

    shell = np.zeros((H_m, W_m, 4), dtype=np.float32)
    rim_tint = np.clip(1.0 - dist / 40.0, 0.0, 1.0) ** 1.7
    shell[:, :, 0] = 222.0
    shell[:, :, 1] = 236.0
    shell[:, :, 2] = 246.0
    shell[:, :, 3] = np.where(alpha_bin, rim_tint * 88.0 + 18.0, 0.0)

    # Curved specular highlights on left-upper curve & bottom-right curve of glass bulbs
    nx = (xx - W_m * 0.5) / (W_m * 0.5)
    for bulb_cy in (H_m * 0.23, H_m * 0.77):
        ny = (yy - bulb_cy) / (H_m * 0.22)
        hl_left = np.exp(-((nx + 0.58 + 0.14 * ny) ** 2) / 0.025) * np.exp(-((ny + 0.15) ** 2) / 0.28)
        hl_right = np.exp(-((nx - 0.62 + 0.10 * ny) ** 2) / 0.020) * np.exp(-((ny - 0.10) ** 2) / 0.24)
        glare = np.clip(hl_left * 0.85 + hl_right * 0.60, 0.0, 1.0) * alpha_bin
        shell[:, :, 0] = shell[:, :, 0] * (1 - glare) + 255.0 * glare
        shell[:, :, 1] = shell[:, :, 1] * (1 - glare) + 252.0 * glare
        shell[:, :, 2] = shell[:, :, 2] * (1 - glare) + 245.0 * glare
        shell[:, :, 3] = np.maximum(shell[:, :, 3], glare * 145.0)

    # Dark crisp ink rim around glass bulb silhouette (dist <= 6.5 on 506px -> ~1.4px scaled on desk)
    ink_edge = alpha_bin & (dist <= 6.5)
    ink_w = np.clip((6.5 - dist) / 2.2, 0.0, 1.0) * ink_edge
    shell[:, :, 0] = shell[:, :, 0] * (1 - ink_w) + 28.0 * ink_w
    shell[:, :, 1] = shell[:, :, 1] * (1 - ink_w) + 20.0 * ink_w
    shell[:, :, 2] = shell[:, :, 2] * (1 - ink_w) + 16.0 * ink_w
    shell[:, :, 3] = np.maximum(shell[:, :, 3], ink_w * 235.0)

    shell_s = Image.fromarray(np.clip(shell, 0, 255).astype(np.uint8), mode="RGBA").resize(
        (253, 526), Image.LANCZOS
    )
    shell_s.save(os.path.join(OUT_DIR, "hg_glass.png"))


def main():
    im = Image.open(SRC_IMAGE).convert("RGB")
    arr = np.array(im, dtype=np.float32)
    bg_arr = arr.copy()

    # 1. Extract all 37 shelf books & paint dark cavities
    for b in BOOKS:
        crop = im.crop((b["x1"], b["y1"], b["x2"], b["y2"])).convert("RGBA")
        crop.save(os.path.join(OUT_DIR, "books", f"book_{b['id']}.png"))
        paint_shelf_cavity(bg_arr, b)

    # 2. Extract Desk Book ("Атлас анатомии человека") & user's Hourglass layers
    extract_desk_book(arr, bg_arr)
    build_custom_hourglass_assets()

    # 3. Extract Planets (with Venus on id=2!)
    H, W = bg_arr.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]
    for p in PLANETS:
        extract_planet_assets(arr, p)
        dist = np.sqrt((xx - p["cx"]) ** 2 + (yy - p["cy"]) ** 2)
        inside = dist <= (p["r"] - 1.2)
        bg_arr[inside] = np.array([22.0, 14.0, 10.0])

    # 4. Gentleman cutout
    man_mask = extract_gentleman_layers(arr)
    man_above_desk = man_mask.copy()
    man_above_desk[558:, :] = False
    bg_clean = inpaint_subtle_margin(bg_arr, man_above_desk)
    Image.fromarray(np.clip(bg_clean, 0, 255).astype(np.uint8)).save(
        os.path.join(OUT_DIR, "bg_study.png")
    )

    # 5. Bundle JS sprites
    bundle = {
        "books": BOOKS,
        "deskBook": DESK_BOOK,
        "planets": PLANETS,
        "images": {},
    }

    def b64(path):
        ext = os.path.splitext(path)[1].lower()
        mime = "image/jpeg" if ext in (".jpg", ".jpeg") else "image/png"
        with open(path, "rb") as f:
            return f"data:{mime};base64," + base64.b64encode(f.read()).decode("ascii")

    bundle["images"]["bg_study"] = b64(os.path.join(OUT_DIR, "bg_study.png"))
    bundle["images"]["gentleman_fg"] = b64(os.path.join(OUT_DIR, "gentleman_fg.png"))
    bundle["images"]["desk_book"] = b64(os.path.join(OUT_DIR, "desk_book.png"))
    bundle["images"]["hg_back"] = b64(os.path.join(OUT_DIR, "hg_back.png"))
    bundle["images"]["hg_front"] = b64(os.path.join(OUT_DIR, "hg_front.png"))
    bundle["images"]["hg_mask"] = b64(os.path.join(OUT_DIR, "hg_mask.png"))
    bundle["images"]["hg_glass"] = b64(os.path.join(OUT_DIR, "hg_glass.png"))
    for k in (1, 2, 3):
        ap_path = os.path.join(OUT_DIR, f"atlas_plate_{k}.jpg")
        if os.path.exists(ap_path):
            bundle["images"][f"atlas_plate_{k}"] = b64(ap_path)
    for p in PLANETS:
        bundle["images"][f"planet_{p['id']}_tex"] = b64(
            os.path.join(OUT_DIR, f"planet_{p['id']}_tex.png")
        )
        bundle["images"][f"planet_{p['id']}_light"] = b64(
            os.path.join(OUT_DIR, f"planet_{p['id']}_light.png")
        )
    for b in BOOKS:
        bundle["images"][f"book_{b['id']}"] = b64(
            os.path.join(OUT_DIR, "books", f"book_{b['id']}.png")
        )

    js_path = os.path.join(OUT_DIR, "scene_bundle.js")
    with open(js_path, "w", encoding="utf-8") as f:
        f.write("window.SCENE_BUNDLE = ")
        json.dump(bundle, f, ensure_ascii=False)
        f.write(";\n")

    # Visual checks
    vis = im.crop((0, 0, 1024, 275)).copy()
    d = ImageDraw.Draw(vis)
    for b in BOOKS:
        d.rectangle([b["x1"], b["y1"], b["x2"], b["y2"]], outline=(0, 255, 140), width=1)
        d.text((b["x1"] + 2, b["y1"] + 2), str(b["id"]), fill=(255, 255, 0))
    vis.save(os.path.join(SCRATCH_DIR, "check_books_37.png"))

    test_render_venus_strip()
    print(f"Asset build complete! {len(BOOKS)} shelf books + 1 desk book. Bundle:", os.path.getsize(js_path))


if __name__ == "__main__":
    main()
