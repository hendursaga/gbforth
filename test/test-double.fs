[asm]


: double dup + ;

main:
$22 push-lit,   \ push $11 to the parameter stack [at $FFFD-$FFFE]
' double # call,   \ call quadruple [dup + dup +]

ret,

[endasm]
