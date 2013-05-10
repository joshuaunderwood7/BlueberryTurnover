function CMDresult(tokens)
{
    var result = 0xE000; //Default to NOP for syntax errors

    if(tokens[0] == "SEQ") 
    {result = 0x0000 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]) << 2);}
    else if(tokens[0] == "ADD") 
    {result = 0x0800 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]) << 2);}
    else if(tokens[0] == "SGT") 
    {result = 0x1000 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]) << 2);}
    else if(tokens[0] == "ADDI") 
    {result = 0x1800 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]));}
    else if(tokens[0] == "SUB") 
    {result = 0x2000 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]) << 2);}
    else if(tokens[0] == "SLT") 
    {result = 0x2800 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]) << 2);}
    else if(tokens[0] == "HALT") 
    {result = 0x3000;}
    else if(tokens[0] == "OR") 
    {result = 0x3800 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]) << 2);}
    else if(tokens[0] == "ORI") 
    {result = 0x4000 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]));}
    else if(tokens[0] == "AND") 
    {result = 0x4800 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]) << 2);}
    else if(tokens[0] == "ANDI") 
    {result = 0x5000 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]));}
    else if(tokens[0] == "XOR") 
    {result = 0x5800 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]) << 2);}
    else if(tokens[0] == "XNOR") 
    {result = 0x6000 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]) << 2);}
    else if(tokens[0] == "NOT") 
    {result = 0x6800 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5);}
    else if(tokens[0] == "SRA") 
    {result = 0x7000 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]));}
    else if(tokens[0] == "SRL") 
    {result = 0x7800 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]));}
    else if(tokens[0] == "SLL") 
    {result = 0x8000 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]));}
    else if(tokens[0] == "SW") 
    {result = 0x8800 | (numberResult(tokens[1]) << 5) | (numberResult(tokens[2]) << 2);}
    else if(tokens[0] == "MUL") 
    {result = 0x9000 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 5) | (numberResult(tokens[3]) << 2);}
    // UNUSED          {result = 0x9800;}
    else if(tokens[0] == "LW") 
    {result = 0xA000 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]) << 2);}
    else if(tokens[0] == "LBI") 
    {result = 0xA800 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]));}
    else if(tokens[0] == "LBIU") 
    {result = 0xB000 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]));}
    else if(tokens[0] == "LHI") 
    {result = 0xB800 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]));}
    else if(tokens[0] == "BEQZ") 
    {result = 0xC000 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]));}
    else if(tokens[0] == "BNEZ") 
    {result = 0xC800 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]));}
    else if(tokens[0] == "BC") 
    {result = 0xD000 | (numberResult(tokens[1]));}
    else if(tokens[0] == "BO") 
    {result = 0xD800 | (numberResult(tokens[1]));}
    else if(tokens[0] == "NOP") 
    {result = 0xE000;}
    else if(tokens[0] == "J") 
    {result = 0xE800 | (numberResult(tokens[1]));}
    else if(tokens[0] == "JR") 
    {result = 0xF000 | (numberResult(tokens[1]) << 5);}
    else if(tokens[0] == "JALR") 
    {result = 0xF800 | (numberResult(tokens[1]) << 8) | (numberResult(tokens[2]));}

    return result;
}
        
function numberResult(token)
{
    if(token.substr(0,1) == "%") { return parseInt(token.substr(1,1)); }
    else { return parseInt(token); }
}

function PARSE()
{
    var input = document.getElementById("asmInput").value;
    var lines = input.split("\n");
    var linecount = lines.length;
    var i = 0;

    document.getElementById("asmOut").innerHTML = "";

    for( ; i < linecount; i++)
    {
        MEMORY[i] = CMDresult(lines[i].split(" "));
        document.getElementById("asmOut").innerHTML += MEMORY[i].toString() + " <br />";
    }

    MEMORY[i] = 0x3000;

    RUNPROGRAM();

}
