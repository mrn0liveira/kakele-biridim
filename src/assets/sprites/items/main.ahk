#NoEnv  ; Evita que o ambiente seja carregado automaticamente
SendMode Input  ; Reduz o atraso de envio
SetWorkingDir %A_ScriptDir%  ; Garante que o diretório de trabalho seja o do script

directory := "C:\Users\Cesar\Documents\Projetos\kakele-biridim-b\src\assets\sprites\items"  ; Substitua pelo caminho do seu diretório

Loop, Files, %directory%\*.png  ; Percorre todos os arquivos .png no diretório
{
    if InStr(A_LoopFileName, "'")  ; Verifica se o nome do arquivo contém apóstrofo
    {
        newFileName := StrReplace(A_LoopFileName, "'", "")  ; Remove os apóstrofos do nome do arquivo

        oldFilePath := A_LoopFileFullPath
        newFilePath := A_LoopFileDir . "\" . newFileName

        FileMove, %oldFilePath%, %newFilePath%  ; Renomeia o arquivo
        if ErrorLevel
        {
            MsgBox, Erro ao renomear: %oldFilePath%
        }
        else
        {
            tooltip, Renomeado: %oldFilePath% -> %newFilePath%
        }
    }
}
