import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import InteractionCommand from "../../structures/command.ts";
import {
  type SupportedLanguages,
  type InteractionArgs,
} from "../../structures/misc.ts";
import { getKakeleEvents } from "../../misc/database/index.ts";
import { createCanvas, type Canvas, loadImage } from "canvas";
import { type IEvent } from "../../database/schemas/event.ts";
import moment from "moment";
import {
  CustomEmbed,
  capitalizeFirstLetter,
  generateDarkRandomColorHex,
} from "../../misc/util/index.ts";
import { fillMixedText } from "../../misc/canvas/index.ts";
import { client } from "../../index.ts";

moment.locale("pt", {
  months:
    "janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro".split(
      "_",
    ),
  monthsShort: "jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez".split("_"),
  monthsParseExact: true,
  weekdays:
    "domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado".split(
      "_",
    ),
  weekdaysShort: "dom_seg_ter_qua_qui_sex_sáb".split("_"),
  weekdaysMin: "D_S_T_Q_Q_S_S".split("_"),
  weekdaysParseExact: true,
  longDateFormat: {
    LT: "HH:mm",
    LTS: "HH:mm:ss",
    L: "DD/MM/YYYY",
    LL: "D [de] MMMM [de] YYYY",
    LLL: "D [de] MMMM [de] YYYY HH:mm",
    LLLL: "dddd, D [de] MMMM [de] YYYY HH:mm",
  },
  calendar: {
    sameDay: "[Hoje às] LT",
    nextDay: "[Amanhã às] LT",
    nextWeek: "dddd [às] LT",
    lastDay: "[Ontem às] LT",
    lastWeek: "dddd [passado às] LT",
    sameElse: "L",
  },
  relativeTime: {
    future: "em %s",
    past: "há %s",
    s: "alguns segundos",
    m: "um minuto",
    mm: "%d minutos",
    h: "uma hora",
    hh: "%d horas",
    d: "um dia",
    dd: "%d dias",
    M: "um mês",
    MM: "%d meses",
    y: "um ano",
    yy: "%d anos",
  },
  dayOfMonthOrdinalParse: /\d{1,2}º/,
});

moment.locale("es", {
  months:
    "enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split(
      "_",
    ),
  monthsShort: "ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic".split("_"),
  monthsParseExact: true,
  weekdays: "domingo_lunes_martes_miércoles_jueves_viernes_sábado".split("_"),
  weekdaysShort: "dom._lun._mar._mié._jue._vie._sáb.".split("_"),
  weekdaysMin: "D_L_M_X_J_V_S".split("_"),
  weekdaysParseExact: true,
  longDateFormat: {
    LT: "HH:mm",
    LTS: "HH:mm:ss",
    L: "DD/MM/YYYY",
    LL: "D [de] MMMM [de] YYYY",
    LLL: "D [de] MMMM [de] YYYY HH:mm",
    LLLL: "dddd, D [de] MMMM [de] YYYY HH:mm",
  },
  calendar: {
    sameDay: "[Hoy a las] LT",
    nextDay: "[Mañana a las] LT",
    nextWeek: "dddd [a las] LT",
    lastDay: "[Ayer a las] LT",
    lastWeek: "dddd [pasado a las] LT",
    sameElse: "L",
  },
  relativeTime: {
    future: "en %s",
    past: "hace %s",
    s: "unos segundos",
    m: "un minuto",
    mm: "%d minutos",
    h: "una hora",
    hh: "%d horas",
    d: "un día",
    dd: "%d días",
    M: "un mes",
    MM: "%d meses",
    y: "un año",
    yy: "%d años",
  },
  dayOfMonthOrdinalParse: /\d{1,2}º/,
});

moment.locale("pl", {
  months:
    "styczeń_luty_marzec_kwiecień_maj_czerwiec_lipiec_sierpień_wrzesień_październik_listopad_grudzień".split(
      "_",
    ),
  monthsShort: "sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paź_lis_gru".split("_"),
  monthsParseExact: true,
  weekdays: "niedziela_poniedziałek_wtorek_środa_czwartek_piątek_sobota".split(
    "_",
  ),
  weekdaysShort: "niedz._pon._wt._śr._czw._pt._sob.".split("_"),
  weekdaysMin: "N_Pn_Wt_Śr_Cz_Pt_So".split("_"),
  weekdaysParseExact: true,
  longDateFormat: {
    LT: "HH:mm",
    LTS: "HH:mm:ss",
    L: "DD/MM/YYYY",
    LL: "D MMMM YYYY",
    LLL: "D MMMM YYYY HH:mm",
    LLLL: "dddd, D MMMM YYYY HH:mm",
  },
  calendar: {
    sameDay: "[Dziś o] LT",
    nextDay: "[Jutro o] LT",
    nextWeek: "dddd [o] LT",
    lastDay: "[Wczoraj o] LT",
    lastWeek: "[W zeszły] dddd [o] LT",
    sameElse: "L",
  },
  relativeTime: {
    future: "za %s",
    past: "%s temu",
    s: "kilka sekund",
    m: "minuta",
    mm: "%d minut",
    h: "godzina",
    hh: "%d godzin",
    d: "dzień",
    dd: "%d dni",
    M: "miesiąc",
    MM: "%d miesięcy",
    y: "rok",
    yy: "%d lat",
  },
  dayOfMonthOrdinalParse: /\d{1,2}\./,
});

moment.locale("en", {
  months:
    "January_February_March_April_May_June_July_August_September_October_November_December".split(
      "_",
    ),
  monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
  monthsParseExact: true,
  weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split(
    "_",
  ),
  weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
  weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
  weekdaysParseExact: true,
  longDateFormat: {
    LT: "HH:mm",
    LTS: "HH:mm:ss",
    L: "MM/DD/YYYY",
    LL: "MMMM D YYYY",
    LLL: "MMMM D YYYY HH:mm",
    LLLL: "dddd, MMMM D YYYY HH:mm",
  },
  calendar: {
    sameDay: "[Today at] LT",
    nextDay: "[Tomorrow at] LT",
    nextWeek: "dddd [at] LT",
    lastDay: "[Yesterday at] LT",
    lastWeek: "dddd [at] LT",
    sameElse: "L",
  },
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
  dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
});

async function createEventCountdownImage(
  data: IEvent[],
  language: SupportedLanguages,
): Promise<Canvas> {
  const header = await loadImage("./src/assets/event-countdown/header.png");

  const canvas = createCanvas(500, data.length * 40 + header.naturalHeight);

  const ctx = canvas.getContext("2d");

  ctx.drawImage(header, 0, 0, header.naturalWidth, header.naturalHeight);

  const overlay = await loadImage("./src/assets/event-countdown/overlay.png");

  moment.locale(language.toLocaleLowerCase());

  data.forEach((event, index) => {
    ctx.fillStyle = generateDarkRandomColorHex();
    ctx.fillRect(0, 0 + index * 40 + header.naturalHeight, 500, 40);

    const date = new Date(Number(event.activation_enabled_unix_seconds) * 1000);

    ctx.drawImage(
      overlay,
      0,
      0 + index * 40 + header.naturalHeight,
      overlay.naturalWidth,
      overlay.naturalHeight,
    );

    ctx.font = "16pt Bebas";
    ctx.fillStyle = "#7a6359";

    ctx.fillText(client.translate("EVENT_COUNTDOWN_TIP", language), 100, 25);

    ctx.font = "18pt Bebas";
    ctx.fillStyle = "#edc2af";

    ctx.fillText(client.translate("EVENT_COUNTDOWN_TITLE", language), 100, 48);

    ctx.font = "16pt Teko";
    ctx.fillStyle = "#d1af58";

    ctx.fillText(capitalizeFirstLetter(data[0].server), 100, 70);

    fillMixedText(
      ctx,
      [
        {
          text: event.language[language],
          font: "15pt Teko",
          fillStyle: "#edc2af",
        },
      ],
      50,
      0 + index * 40 + 20 + header.naturalHeight,
    );

    fillMixedText(
      ctx,
      [
        {
          text: moment(date).fromNow(),
          font: "10pt HelveticaBold",
          fillStyle: "#edc2af",
        },
        {
          text: `       ${moment(date).utc().calendar()}`,
          font: "8pt HelveticaBold",
          fillStyle: "#917163",
        },
      ],
      50,
      0 + index * 40 + 35 + header.naturalHeight,
    );
  });

  return canvas;
}

export default new InteractionCommand({
  data: new SlashCommandBuilder()
    .setName("event-countdown")
    .setDescription("Check when a Kakele event will be active")
    .setDescriptionLocalizations({
      "es-ES": "Verifica cuándo estará activo un evento de Kakele",
      "pt-BR": "Verifica quando um evento do Kakele será ativo",
      pl: "Sprawdź, kiedy będzie aktywne wydarzenie Kakele",
    })
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription("The server to be used")
        .setDescriptionLocalizations({
          "es-ES": "El servidor a utilizar",
          "pt-BR": "O servidor a ser utilizado",
          pl: "Serwer do użycia",
        })

        .addChoices(
          {
            name: "South America - Red",
            value: "red",
            name_localizations: {
              "es-ES": "Sudamérica - Rojo",
              "pt-BR": "América do Sul - Vermelho",
              pl: "Ameryka Południowa - Czerwony",
            },
          },
          {
            name: "South America - Blue",
            value: "blue",
            name_localizations: {
              "es-ES": "Sudamérica - Azul",
              "pt-BR": "América do Sul - Azul",
              pl: "Ameryka Południowa - Niebieski",
            },
          },
          {
            name: "South America - Yellow",
            value: "yellow",
            name_localizations: {
              "es-ES": "Sudamérica - Amarillo",
              "pt-BR": "América do Sul - Amarelo",
              pl: "Ameryka Południowa - Żółty",
            },
          },
          {
            name: "South America - Pink",
            value: "pink",
            name_localizations: {
              "es-ES": "Sudamérica - Rosa",
              "pt-BR": "América do Sul - Rosa",
              pl: "Ameryka Południowa - Różowy",
            },
          },
          {
            name: "North America - Lime",
            value: "lime",
            name_localizations: {
              "es-ES": "Norteamérica - Lima",
              "pt-BR": "América do Norte - Limão",
              pl: "Ameryka Północna - Zielony",
            },
          },
          {
            name: "North America - Violet",
            value: "violet",
            name_localizations: {
              "es-ES": "Norteamérica - Violeta",
              "pt-BR": "América do Norte - Violeta",
              pl: "Ameryka Północna - Fioletowy",
            },
          },
          {
            name: "Southeast Asia - White",
            value: "white",
            name_localizations: {
              "es-ES": "Sudeste de Asia - Blanco",
              "pt-BR": "Sudeste Asiático - Branco",
              pl: "Azja Południowo-Wschodnia - Biały",
            },
          },
          {
            name: "Europe - Green",
            value: "green",
            name_localizations: {
              "es-ES": "Europa - Verde",
              "pt-BR": "Europa - Verde",
              pl: "Europa - Zielony",
            },
          },
          {
            name: "Europe - Orange",
            value: "orange",
            name_localizations: {
              "es-ES": "Europa - Naranja",
              "pt-BR": "Europa - Laranja",
              pl: "Europa - Pomarańczowy",
            },
          },
        )
        .setRequired(true),
    ),
  options: {
    clientPermissions: [
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.UseExternalEmojis,
      PermissionFlagsBits.AttachFiles,
    ],
    cooldown: 3,
    guilds: [],
    premium: false,
    ephemeral: false,
  },
  async run(
    interaction: ChatInputCommandInteraction<"cached">,
    args: InteractionArgs,
  ) {
    const server = interaction.options.getString("server") ?? "";

    const events: IEvent[] =
      (await getKakeleEvents({})).filter(
        (x) =>
          Number(x.activation_enabled_unix_seconds) >
            new Date().getTime() / 1000 && x.server === server,
      ) ?? [];

    if (events.length === 0) {
      await interaction.editReply({
        embeds: [
          new CustomEmbed()
            .setTitle(
              client.translate(
                "EVENT_COUNTDOWN_NO_EVENTS_TITLE",
                args.language,
              ),
            )
            .setDescription(
              client.translate("INTERACTION_TIP_REPORT", args.language),
            )
            .setAuthor({
              name: "Kakele Biridim",
              iconURL: client.icons.ElderVampireBrooch,
            })
            .setColor(client.colors.DarkRed),
        ],
      });
      return;
    }

    const image = await createEventCountdownImage(
      events.sort(
        (a, b) =>
          parseFloat(a.activation_enabled_unix_seconds) -
          parseFloat(b.activation_enabled_unix_seconds),
      ),
      args.language,
    );

    await interaction.editReply({
      files: [
        {
          name: `${interaction.commandName}-${server}.png`,
          attachment: image.toBuffer(),
        },
      ],
      embeds: [],
      components: [],
    });
  },
});
