//8 16 bit registers and a 16 bit program counter
var REG = new Array(8);
var PC;
var MEMORY = new Array(0x10000);
var halt = false;

//format: SEQ Rd Rs1 Rs2
//Set register Rd to 1 if the values in Rs1 and
//Rs2 are equal, else set to 0.
function SEQ(word)
{
	if(REG[((0x00E0 & word)>>5)] == REG[((0x001C & word)>>2)]){
		REG[((0x0700 & word)>>8)] = 1;
	}
	else{
		REG[((0x0700 & word)>>8)] = 0;
	}
}

//format: ADD Rd Rs1 Rs2
//Add registers Rs1 and Rs2 and store the
//result in Rd.
function ADD(word)
{
	REG[((0x0700 & word)>>8)] =(REG[((0x00E0 & word)>>5)] + REG[((0x001C & word)>>2)])
	//check overflow
	REG[((0x0700 & word)>>8)] = REG[((0x0700 & word)>>8)] & 0xFFFF;
}

//SGT Rd Rs1 Rs2
//Set register Rd to 1 if Rs1 > Rs2, else set to 0.
function SGT(word)
{
	if(REG[((0x00E0 & word)>>5)] > REG[((0x001C & word)>>2)]){
		REG[((0x0700 & word)>>8)] = 1;
	}
	else{
		REG[((0x0700 & word)>>8)] = 0;
	}
}

//ADDI Rd Rs #
//Store in register Rd the value Rs + the 5-bit
//sign-extended immediate.
function ADDI(word)
{
	REG[((0x0700 & word)>>8)] =(REG[((0x00E0 & word)>>5)] + (0x001F & word))
	//check overflow
	REG[((0x0700 & word)>>8)] = REG[((0x0700 & word)>>8)] & 0xFFFF;
}

//SUB Rd Rs1 Rs2
//Compute Rs1 - Rs2 and store the result in Rd.
function SUB(word)
{
	REG[((0x0700 & word)>>8)] =(REG[((0x00E0 & word)>>5)] - REG[((0x001C & word)>>2)])
	//check underflow
	if ( REG[((0x0700 & word)>>8)] ) {
		REG[((0x0700 & word)>>8)] = 0xFFFF - REG[((0x0700 & word)>>8)];
	}
}

//SLT Rd Rs1 Rs2
//Set register Rd to 1 if Rs1 < Rs2, else set to 0.
function SLT(word)
{
	if(REG[((0x00E0 & word)>>5)] < REG[((0x001C & word)>>2)]){
		REG[((0x0700 & word)>>8)] = 1;
	}
	else{
		REG[((0x0700 & word)>>8)] = 0;
	}
}

// UNUSED 00110 

//OR Rd Rs1 Rs2
//Store in register Rd the bitwise OR of Rs1 and
//Rs2.
function OR(word)
{
    REG[((0x0700 & word)>>8)] =(REG[((0x00E0 & word)>>5)] | REG[((0x001C & word)>>2)]);
}

//ORI Rd Rs #
//Store in register Rd the bitwise OR of Rs and
//the 5-bit zero-extended immediate.
function ORI(word)
{
    REG[((0x0700 & word)>>8)] =(REG[((0x00E0 & word)>>5)] | (0x001F & word));
}

//AND Rd Rs1 Rs2
//Store in register Rd the bitwise AND of Rs1
//and Rs2.
function AND(word)
{
    REG[((0x0700 & word)>>8)] =(REG[((0x00E0 & word)>>5)] & REG[((0x001C & word)>>2)]);
}

//ANDI Rd Rs #
//Store in register Rd the bitwise AND of Rs
//and the 5-bit zero-extended immediate.
function ANDI(word)
{
    REG[((0x0700 & word)>>8)] =(REG[((0x00E0 & word)>>5)] & (0x001F & word));
}

//XOR Rd Rs1 Rs2
//Store in register Rd the bitwise XOR of Rs1
//and Rs2.
function XOR(word)
{
    REG[((0x0700 & word)>>8)] =(REG[((0x00E0 & word)>>5)] ^ REG[((0x001C & word)>>2)]);
}

//XNOR Rd Rs1 Rs2
//Store in register Rd the bitwise XNOR of Rs1
//and Rs2.
function XNOR(word)
{
    REG[((0x0700 & word)>>8)] = (~(REG[((0x00E0 & word)>>5)] ^ REG[((0x001C & word)>>2)]));
}

//NOT Rd Rs
//Store in register Rd the bitwise complement
//Rs.
function NOT(word)
{
    REG[((0x0700 & word)>>8)] = (~(REG[((0x00E0 & word)>>5)]));
}

//SRA Rd Rs #
//Store in register Rd the sign-extended value
//of Rs shifted to the right by the 5-bit
//immediate. (An immediate of 0 does not shift
//the operand).
function SRA(word)
{
    var temp = (REG[((0x00E0 & word)>>5)]);
    for(var x=0; x < 0x001F & word; x+=1)
    {
        temp = ((temp >> 1) & (temp & 0x8000)) ;
    }
    REG[((0x0700 & word)>>8)] = temp;
}

//SRL Rd Rs #
//Store in register Rd the zero-extended value
//of Rs shifted to the right by the 5-bit
//immediate.
function SRL(word)
{
    var temp = (REG[((0x00E0 & word)>>5)]);
    for(var x=0; x < 0x001F & word; x+=1)
    {
        temp = ((temp >> 1) & (temp & 0x7FFF)); 
    }
    REG[((0x0700 & word)>>8)] = temp;
}

//SLL Rd Rs #
//Store in register Rd the zero-extended value
//of Rs shifted to the left by the 2-bit
//immediate.
function SLL(word)
{
    var temp = (REG[((0x00E0 & word)>>5)]);
    for(var x=0; x < 0x001F & word; x+=1)
    {
        temp = ((temp << 1) & (temp & 0xFFFE)) ;
    }
    REG[((0x0700 & word)>>8)] = temp;
}

//SW 0 Rs Raddr
//Store to memory at address Raddr the value
//in Rs. (You can assume that address is an
//even number and the compiler inserts 3 zero
//bits for Rd).
function SW(word)
{
    MEMORY[REG[((0x001C & word)>>2)]] = REG[((0x00E0 & word)>>5)];
}

//MUL Rd Rs1 Rs2
//Multiply the lower 8 bits of Rs1 and Rs2 and
//store the result in Rd.
function MUL(word)
{
	REG[((0x0700 & word)>>8)] =((REG[((0x00E0 & word)>>5)] & 0x00FF) + (REG[((0x001C & word)>>2)] & 0x00FF));
}

// UNUSED 00110 

//LR Rd 0 Raddr
//Load the word value at memory address
//Raddr into Rd. (You can assume that address
//is an even number and the compiler inserts 3
//zero bits for Rs).
function LW(word)
{
    REG[((0x0700 & word)>>8)] = MEMORY[REG[((0x001C & word)>>2)]];
}

//LBI Rd #
//Store the 8-bit sign-extended immediate into
//register Rd after sign extending it.
function LBI(word)
{
    REG[((0x0700 & word)>>8)] = (word & 0x00FF);
    if( (word & 0x0070) != 0 )
    {
        REG[((0x0700 & word)>>8)] = REG[((0x0700 & word)>>8)] | 0xFF00;
    }
}

//LBIU Rd #
//Write the 8-bit zero-extended immediate
//into register Rd.
function LBIU(word)
{
    REG[((0x0700 & word)>>8)] = (word & 0x00FF);
}

//LHI Rd #
//Write the 8-bit immediate into the upper 8
//bits of register Rd and optionally clear the
//low order 8 bits.
function LHI(word)
{
    REG[((0x0700 & word)>>8)] = ((word << 8) & 0xFF00);
}

//BEQZ Rs #
//Set PC to PC + 8-bit sign-extended
//immediate if the value in register Rs is zero.
function BEQZ(word)
{
    if( REG[((0x0700 & word)>>8)] == 0 )
    {
        PC = (word & 0x00FF);
    }
}

//BNEZ Rs #
//Set PC to PC + 8-bit sign-extended
//immediate if the value in register Rs is non-
//zero.
function BNEZ(word)
{
    if( REG[((0x0700 & word)>>8)] != 0 )
    {
        PC = (word & 0x00FF);
    }
}

//BC #
//Set PC to PC + 11-bit sign-extended
//immediate if the carry out is set.
function BC(word)
{

}

//BO #
//Set PC to PC + 11-bit sign-extended
//immediate if the overflowis set.
function BO(word)
{

}

//NOP
//Do nothing.
function NOP(word)
{ }

//J #
//Set the PC to PC + 11-bit sign-extended
//immediate.
function J(word)
{}

//JR 0 Rs
//Set the PC to the value in register Rs.
function JR(word)
{

}

//JALR Rd #
//Rd=PC, PC=PC+#. Save the current value of
//PC (which points to the NEXT instruction) to
//register Rd and set PC to PC + 8-bit sign-
//extended immediate.
function JALR(word)
{

}

//givin a 16 bit word, executes function
//based on five opcode bits (MSB)
function EXECUTE(word)
{
	op_code = word >> 11;
	switch(op_code) {
		case 0: SEQ(word); break;
		case 1: ADD(word); break;
		case 2: SGT(word); break;
		case 3: ADDI(word); break;
		case 4: SUB(word); break;
		case 5: SLT(word); break;
		case 6: /* Unused */ break;
		case 7: OR(word); break;
		case 8: ORI(word); break;
		case 9: AND(word); break;
		case 10: ANDI(word); break;
		case 11: XOR(word); break;
		case 12: XNOR(word); break;
		case 13: NOT(word); break;
		case 14: SRA(word); break;
		case 15: SRL(word); break;
		case 16: SLL(word); break;
		case 17: SW(word); break;
		case 18: MUL(word); break;
		case 19: /* Unused */ break;
		case 20: LW(word); break;
		case 21: LBI(word); break;
		case 22: LBIU(word); break;
		case 23: LHI(word); break;
		case 24: BEQZ(word); break;
		case 25: BNEZ(word); break;
		case 26: BC(word); break;
		case 27: BO(word); break;
		case 28: NOP(word); break;
		case 29: J(word); break;
		case 30: JR(word); break;
		case 31: JALR(word); break;
	}
}

function STARTCPU()
{

    document.body.addEventListener("keyup", HALT, false);
   
    for(var i = 0; i < 8; i++)
    { 
        REG[i] = 0; 
        document.getElementById("REG"+i).innerHTML=("REG" + i + " = " + REG[i]);
    }

    PC = 0;

    for(var i = 0; i < 0x10000; i++)
    { MEMORY[i] = 0; }

    
    
    MEMORY[0] = 0xB0FF;
    MEMORY[1] = 0xB1A4;
    MEMORY[2] = 0x4B04;
    
    for(var i = 0; i < 3; i++)
    {
        EXECUTE(MEMORY[PC]);
        PC++;
    }
    
    for(var i = 0; i < 8; i++)
    { 
        document.getElementById("REG"+i).innerHTML=("REG" + i + " = " + REG[i].toString(16));
    }
    
    /*
    window.addEventListener( "" , function() { halt = true; }, false)
    for(for i = 0 ; !halt || i < 0xFFFFF; i++ )
    {
        document.getElementById("REG7").innerHTML += ".";
    }
    /*
    for( ; PC < 0x10000; PC++)
    { EXECUTE(MEMORY[PC]); }
    */
    
}

function HALT()
{   halt = true;   }